// Supabase Edge Function: shiprocket-dispatch
// Runs securely server-side on Deno / Supabase Edge Functions
// Authenticates incoming requests via Supabase JWT, validates admin authorization,
// loads server-authoritative order details, enforces payment protection, acquires atomic lease,
// attempts pre-flight crash-recovery lookup with Shiprocket, manifests shipment, generates AWB,
// and atomically updates order timeline & tracking details.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

// Server-side environment secrets
const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL') || '';
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD') || '';
const SHIPROCKET_PICKUP_LOCATION = Deno.env.get('SHIPROCKET_PICKUP_LOCATION') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// In-memory token cache (Shiprocket auth tokens are valid for 10 days)
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiryTime - 3600000) {
    return cachedToken;
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shiprocket auth failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error('Shiprocket auth response missing token property');
  }

  cachedToken = data.token;
  tokenExpiryTime = now + 9 * 86400000; // 9 days cache
  return cachedToken;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
  }

  try {
    // 2. Authenticate incoming request via Supabase user JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
    }

    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!userJwt) {
      return jsonResponse({ error: 'Unauthorized: Bearer token is empty' }, 401);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Server configuration error: Supabase service environment is incomplete' }, 500);
    }

    // Verify user identity with Supabase Auth
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: `Unauthorized: ${authError?.message || 'Invalid authentication token'}` }, 401);
    }

    // 3. Verify user has administrative privileges using is_admin() and confirmed admin_users columns
    // Execute public.is_admin() with authenticated user client so auth.uid() reflects user's JWT
    const { data: isAdminRpc, error: rpcError } = await supabaseUser.rpc('is_admin');

    if (rpcError || isAdminRpc !== true) {
      return jsonResponse({ error: 'Forbidden: Administrative privileges required to dispatch shipments' }, 403);
    }

    // Secondary verification against public.admin_users using ONLY confirmed columns:
    // (id, auth_user_id, email, name, role, avatar, created_at, last_login)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: adminRecord, error: adminErr } = await supabaseAdmin
      .from('admin_users')
      .select('id, auth_user_id, email, name, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (adminErr || !adminRecord) {
      return jsonResponse({ error: 'Forbidden: Administrator profile not found' }, 403);
    }

    const authorizedRoles = ['super_admin', 'admin', 'manager'];
    if (!authorizedRoles.includes(adminRecord.role)) {
      return jsonResponse(
        { error: `Forbidden: Role "${adminRecord.role}" is not authorized to dispatch shipments` },
        403
      );
    }

    const adminName = adminRecord.name || user.email || 'Admin';

    // 4. Validate Shiprocket credentials & pickup location configuration
    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return jsonResponse(
        { error: 'Server configuration error: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD secret is unset' },
        500
      );
    }

    if (!SHIPROCKET_PICKUP_LOCATION) {
      return jsonResponse(
        { error: 'Server configuration error: SHIPROCKET_PICKUP_LOCATION secret is unset. Configure your registered Shiprocket pickup location.' },
        500
      );
    }

    // 5. Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const orderId = (body?.order_id || body?.orderId || '').trim();
    if (!orderId) {
      return jsonResponse({ error: 'Missing required field: order_id' }, 400);
    }

    const courierId = body?.courier_id || body?.courierId || undefined;
    const isMockAwb = Boolean(body?.mock_awb || body?.simulate_awb);
    const isMockShipment = Boolean(body?.mock_shipment);

    // 6. Load authoritative order and order_items directly from database
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr) {
      return jsonResponse({ error: `Database error querying order: ${orderErr.message}` }, 500);
    }

    if (!order) {
      return jsonResponse({ error: `Order "${orderId}" not found in database` }, 404);
    }

    // 7. Cancellation Guard
    if (order.shipping_status === 'cancelled' || order.fulfillment_status === 'cancelled') {
      return jsonResponse(
        {
          error: `Cannot dispatch cancelled order "${order.order_number}". Shipment booking is blocked.`,
          shipping_status: order.shipping_status,
          fulfillment_status: order.fulfillment_status,
        },
        400
      );
    }

    // 8. Payment Protection Check
    const paymentMethod = (order.payment_method || '').toLowerCase();
    const paymentStatus = (order.payment_status || '').toLowerCase();
    const isCOD = paymentMethod === 'cod';
    const isPaid = ['paid', 'captured'].includes(paymentStatus);

    if (!isCOD && !isPaid) {
      return jsonResponse(
        {
          error: `Payment protection block: Cannot dispatch prepaid order with payment_status "${order.payment_status}". Payment must be captured/paid before shipment.`,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
        },
        400
      );
    }

    // 8. Acquire Atomic Dispatch Claim
    // Prevents concurrent administrators or duplicate requests from racing to create duplicate Shiprocket orders
    const claimToken = crypto.randomUUID();
    const existingShipment = order.shipment_details || {};
    const LEASE_SECONDS = 300; // 5-minute lease

    const { data: claimData, error: claimErr } = await supabaseAdmin.rpc('claim_order_for_dispatch', {
      p_order_id: orderId,
      p_claim_token: claimToken,
      p_admin_name: adminName,
      p_lease_seconds: LEASE_SECONDS,
    });

    if (claimErr) {
      return jsonResponse({ error: `Database error acquiring dispatch claim: ${claimErr.message}` }, 500);
    }

    if (!claimData?.success) {
      if (claimData?.error_code === 'ALREADY_DISPATCHED') {
        const details = claimData.shipment_details || existingShipment;
        return jsonResponse(
          {
            success: true,
            already_dispatched: true,
            message: claimData.message,
            shipment_id: details.shipmentId,
            shiprocket_order_id: details.shiprocketOrderId,
            awb_code: details.awbCode,
            courier_name: details.courierName,
            tracking_url: details.trackingUrl,
          },
          200
        );
      }

      if (claimData?.error_code === 'CLAIM_ACTIVE') {
        return jsonResponse(
          {
            error: 'Dispatch currently in progress by another request. Please wait a moment before retrying.',
            details: claimData.message,
            claimed_by: claimData.claimed_by,
            claim_expires_at: claimData.claim_expires_at,
          },
          409
        );
      }

      return jsonResponse(
        { error: claimData?.message || 'Unable to claim order for dispatch' },
        400
      );
    }

    // Issue 1: Track dispatch lease deadline to prevent expired requests from continuing long external calls
    const leaseExpiresAtMs = new Date(claimData.claim_expires_at).getTime();
    function assertLeaseActive(): void {
      // 30-second safeguard buffer before absolute database expiry
      if (Date.now() + 30000 >= leaseExpiresAtMs) {
        throw new Error('Dispatch lease approaching expiration; aborted external request to prevent duplicate manifestation.');
      }
    }

    // Helper fetch with explicit timeout and lease validation
    async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 25000): Promise<Response> {
      assertLeaseActive();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    }

    // 9. Sanitize customer and shipping address fields from authoritative database records
    const customerInfo = order.customer_info || {};
    const shippingAddr = order.shipping_address || {};

    const customerName = (customerInfo.name || shippingAddr.fullName || 'Customer').trim();
    const customerEmail = (customerInfo.email || shippingAddr.email || 'customer@funkyfox.in').trim();
    const customerPhone = (customerInfo.phone || shippingAddr.phone || '').replace(/[^0-9]/g, '');

    const street = (shippingAddr.street || '').trim();
    const city = (shippingAddr.city || '').trim();
    const state = (shippingAddr.state || '').trim();
    const pincode = (shippingAddr.pincode || '').replace(/[^0-9]/g, '').trim();
    const country = (shippingAddr.country || 'India').trim();

    if (!street || !city || !state || !pincode || pincode.length !== 6) {
      await supabaseAdmin.rpc('release_order_dispatch_claim', {
        p_order_id: orderId,
        p_claim_token: claimToken,
        p_error_message: 'Incomplete shipping address: valid 6-digit postal code and address fields required.',
      });

      return jsonResponse(
        {
          error: `Incomplete shipping address: street="${street}", city="${city}", state="${state}", pincode="${pincode}". Valid 6-digit postal code and address fields required.`,
        },
        400
      );
    }

    // 10. Map line items using actual database SKU, quantity, and database price
    const orderItems = order.order_items || [];
    if (orderItems.length === 0) {
      await supabaseAdmin.rpc('release_order_dispatch_claim', {
        p_order_id: orderId,
        p_claim_token: claimToken,
        p_error_message: 'Order contains no line items.',
      });

      return jsonResponse({ error: 'Cannot manifest shipment: order contains no line items.' }, 400);
    }

    const shiprocketItems = orderItems.map((it: any) => ({
      name: it.name || 'Garment',
      sku: it.sku || it.product_id || `FF-${it.id}`,
      units: Number(it.quantity) || 1,
      selling_price: Number(it.price) || 0,
    }));

    // Server-calculated package weight (0.4 kg per unit, min 0.5 kg, max 10 kg)
    const calculatedWeight = Math.min(
      10,
      Math.max(
        0.5,
        orderItems.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1) * 0.4, 0)
      )
    );

    // Use subtotal (not total) for the Shiprocket item subtotal
    const itemSubtotal =
      Number(order.subtotal) ||
      shiprocketItems.reduce((acc: number, it: any) => acc + it.units * it.selling_price, 0);

    // Parse name components safely for Shiprocket billing requirements
    const nameTokens = customerName.split(/\s+/).filter(Boolean);
    const firstName = nameTokens[0] || 'Customer';
    const lastName = nameTokens.slice(1).join(' ') || '.';
    const orderDateFormatted = new Date(order.created_at).toISOString().slice(0, 16).replace('T', ' ');

    // 11. Authenticate with Shiprocket
    let token: string;
    try {
      token = await getShiprocketToken();
    } catch (authErr: any) {
      await supabaseAdmin.rpc('release_order_dispatch_claim', {
        p_order_id: orderId,
        p_claim_token: claimToken,
        p_error_message: `Shiprocket authentication error: ${authErr.message}`,
      });
      return jsonResponse({ error: `Shiprocket authentication error: ${authErr.message}` }, 502);
    }

    // 12. Create Adhoc Order in Shiprocket (or reuse existing shipmentId if retry or crash-recovery)
    let shipmentId = claimData.existing_shipment_id || existingShipment.shipmentId;
    let shiprocketOrderId = claimData.existing_shiprocket_order_id || existingShipment.shiprocketOrderId;
    let awbCode = '';
    let courierName = '';
    let trackingUrl = '';

    // Issue 2: Crash Scenario Recovery — if shipmentId is missing from database, query Shiprocket by channel_order_id
    // to check if a previous aborted/crashed attempt already created the order before database write
    if (!shipmentId) {
      try {
        const lookupRes = await fetchWithTimeout(
          `https://apiv2.shiprocket.in/v1/external/orders?filter_by=channel_order_id&filter=${encodeURIComponent(order.order_number)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
          15000
        );

        if (lookupRes.ok) {
          const lookupData = await lookupRes.json();
          const matchedOrder = Array.isArray(lookupData?.data)
            ? lookupData.data.find((o: any) => String(o.channel_order_id) === String(order.order_number))
            : null;

          if (matchedOrder) {
            shiprocketOrderId = matchedOrder.id;
            const firstShipment = matchedOrder.shipments?.[0];
            if (firstShipment?.id) {
              shipmentId = firstShipment.id;
            } else if (matchedOrder.shipment_id) {
              shipmentId = matchedOrder.shipment_id;
            }

            if (firstShipment?.awb) {
              awbCode = firstShipment.awb;
              courierName = firstShipment.courier_name || matchedOrder.courier_name || 'Assigned Courier';
              trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
            }
          }
        }
      } catch (lookupErr: any) {
        console.warn('[shiprocket-dispatch] Pre-flight order lookup non-fatal warning:', lookupErr?.message);
      }
    }

    // If still no shipmentId, create adhoc order in Shiprocket
    if (!shipmentId) {
      if (isMockShipment) {
        shipmentId = `MOCK-SHIP-${Date.now()}`;
        shiprocketOrderId = `MOCK-ORDER-${Date.now()}`;
      } else {
        let createOrderRes: Response;
        try {
        createOrderRes = await fetchWithTimeout(
          'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              order_id: order.order_number,
              order_date: orderDateFormatted,
              pickup_location: SHIPROCKET_PICKUP_LOCATION,
              billing_customer_name: firstName,
              billing_last_name: lastName,
              billing_address: street,
              billing_city: city,
              billing_pincode: pincode,
              billing_state: state,
              billing_country: country,
              billing_email: customerEmail,
              billing_phone: customerPhone,
              shipping_is_billing: true,
              order_items: shiprocketItems,
              payment_method: isCOD ? 'COD' : 'Prepaid',
              sub_total: itemSubtotal,
              length: 15,
              breadth: 12,
              height: 5,
              weight: calculatedWeight,
            }),
          },
          25000
        );
      } catch (fetchErr: any) {
        await supabaseAdmin.rpc('release_order_dispatch_claim', {
          p_order_id: orderId,
          p_claim_token: claimToken,
          p_error_message: `Shiprocket create request timeout or error: ${fetchErr.message}`,
        });
        return jsonResponse({ error: `Shiprocket order creation timed out or failed: ${fetchErr.message}` }, 504);
      }

      let createOrderData: any = {};
      try {
        createOrderData = await createOrderRes.json();
      } catch (parseErr: any) {
        createOrderData = { error: 'Failed to parse JSON response from Shiprocket adhoc creation API' };
      }

      console.log('[shiprocket-dispatch] Shiprocket adhoc creation response status:', createOrderRes.status, 'body:', JSON.stringify(createOrderData));

      // Validate official Shiprocket success fields:
      // Response must contain a valid, non-null shipment_id and status_code must NOT be 0 or 422
      const candidateShipmentId = createOrderData?.shipment_id || createOrderData?.data?.shipment_id;
      const candidateOrderId = createOrderData?.order_id || createOrderData?.data?.order_id;
      const isCreationSuccess =
        createOrderRes.ok &&
        Boolean(candidateShipmentId) &&
        Boolean(candidateOrderId) &&
        createOrderData?.status_code !== 0 &&
        createOrderData?.status_code !== 422;

      if (!isCreationSuccess) {
        const errorDetail =
          createOrderData?.message ||
          (createOrderData?.errors ? JSON.stringify(createOrderData.errors) : null) ||
          (typeof createOrderData === 'object' ? JSON.stringify(createOrderData) : String(createOrderData));

        // If Shiprocket indicates duplicate/existing order, attempt one final lookup recovery
        if (
          errorDetail.toLowerCase().includes('already') ||
          errorDetail.toLowerCase().includes('duplicate') ||
          errorDetail.toLowerCase().includes('exist')
        ) {
          try {
            const retryLookup = await fetchWithTimeout(
              `https://apiv2.shiprocket.in/v1/external/orders?filter_by=channel_order_id&filter=${encodeURIComponent(order.order_number)}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              },
              10000
            );
            if (retryLookup.ok) {
              const retryData = await retryLookup.json();
              const found = Array.isArray(retryData?.data)
                ? retryData.data.find((o: any) => String(o.channel_order_id) === String(order.order_number))
                : null;
              if (found) {
                shiprocketOrderId = found.id;
                shipmentId = found.shipments?.[0]?.id || found.shipment_id || found.id;
                if (found.shipments?.[0]?.awb) {
                  awbCode = found.shipments[0].awb;
                  courierName = found.shipments[0].courier_name || found.courier_name || 'Assigned Courier';
                  trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
                }
              }
            }
          } catch {
            // ignore retry lookup failure
          }
        }

        if (!shipmentId) {
          await supabaseAdmin.rpc('release_order_dispatch_claim', {
            p_order_id: orderId,
            p_claim_token: claimToken,
            p_error_message: `Shiprocket order creation rejected (${createOrderRes.status}): ${errorDetail}`,
          });

          return jsonResponse(
            { error: `Shiprocket order creation rejected (${createOrderRes.status}): ${errorDetail}`, details: createOrderData },
            createOrderRes.status >= 500 ? 502 : 400
          );
        }
      } else {
        shipmentId = candidateShipmentId;
        shiprocketOrderId = candidateOrderId;
      }
    }
  }

    // 13. Assign AWB (if not already assigned)
    if (shipmentId && !awbCode) {
      if (isMockAwb) {
        awbCode = `MOCK-AWB-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        courierName = 'Shiprocket Simulated Express';
        trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      } else {
        let awbRes: Response;
      try {
        awbRes = await fetchWithTimeout(
          'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              shipment_id: shipmentId,
              courier_id: courierId ? Number(courierId) : undefined,
            }),
          },
          25000
        );
      } catch (awbFetchErr: any) {
        // Preserve shipmentId so subsequent retry does not create another Shiprocket order
        await supabaseAdmin.rpc('release_order_dispatch_claim', {
          p_order_id: orderId,
          p_claim_token: claimToken,
          p_error_message: `AWB assignment network timeout: ${awbFetchErr.message}`,
          p_shipment_id: String(shipmentId),
          p_shiprocket_order_id: String(shiprocketOrderId),
        });
        return jsonResponse(
          {
            error: `Shiprocket AWB assignment timed out: ${awbFetchErr.message}`,
            shipment_id: shipmentId,
            shiprocket_order_id: shiprocketOrderId,
          },
          504
        );
      }

      let awbData: any = {};
      try {
        awbData = await awbRes.json();
      } catch {
        awbData = { error: 'Failed to parse JSON response from Shiprocket AWB assign API' };
      }

      console.log('[shiprocket-dispatch] Shiprocket AWB response status:', awbRes.status, 'body:', JSON.stringify(awbData));

      const isAwbSuccess =
        awbRes.ok &&
        awbData &&
        awbData.awb_assign_status !== 0 &&
        Boolean(awbData.response?.data?.awb_code);

      if (!isAwbSuccess) {
        const errorMessage =
          awbData.message ||
          awbData.response?.data?.awb_assign_error ||
          (typeof awbData === 'object' ? JSON.stringify(awbData) : String(awbData));

        // Release claim while preserving shipmentId and shiprocketOrderId for safe retry
        await supabaseAdmin.rpc('release_order_dispatch_claim', {
          p_order_id: orderId,
          p_claim_token: claimToken,
          p_error_message: `Shiprocket AWB assignment failed: ${errorMessage}`,
          p_shipment_id: String(shipmentId),
          p_shiprocket_order_id: String(shiprocketOrderId),
        });

        return jsonResponse(
          {
            error: `Shiprocket AWB assignment failed: ${errorMessage}`,
            shipment_id: shipmentId,
            shiprocket_order_id: shiprocketOrderId,
            details: awbData,
          },
          awbRes.status >= 500 ? 502 : 400
        );
      }

      if (awbData.response?.data) {
        awbCode = awbData.response.data.awb_code || '';
        courierName = awbData.response.data.courier_name || 'Assigned Courier';
        trackingUrl = awbCode ? `https://shiprocket.co/tracking/${awbCode}` : '';
      }
    }
  }

    // MANDATORY INTEGRITY GUARD:
    // Never finalize database order or mark packed/fulfilled if AWB code or shipment ID is missing!
    if (!shipmentId || !awbCode) {
      const missingReason = !shipmentId
        ? 'Shipment ID was not allocated by Shiprocket'
        : 'AWB tracking code was not assigned by courier';

      await supabaseAdmin.rpc('release_order_dispatch_claim', {
        p_order_id: orderId,
        p_claim_token: claimToken,
        p_error_message: `Dispatch incomplete: ${missingReason}. Order not manifested.`,
        p_shipment_id: shipmentId ? String(shipmentId) : undefined,
        p_shiprocket_order_id: shiprocketOrderId ? String(shiprocketOrderId) : undefined,
      });

      return jsonResponse(
        {
          error: `Cannot finalize dispatch: ${missingReason}. Verify Shiprocket wallet balance, courier serviceability, and pickup address.`,
          shipment_id: shipmentId,
          shiprocket_order_id: shiprocketOrderId,
        },
        502
      );
    }

    // 14. Finalize Order Dispatch in Supabase (Atomic Manifest & Timeline Update)
    // Advance pre-dispatch orders ('pending', 'confirmed', 'processing') directly to 'packed' ('Packed & Ready').
    // Strictly preserve order progression: never regress an already-packed, shipped, delivered, or terminal order.
    const eligiblePreDispatchStatuses = ['pending', 'confirmed', 'processing'];
    let targetShippingStatus: string | null = null;
    if (eligiblePreDispatchStatuses.includes(order.shipping_status)) {
      targetShippingStatus = 'packed';
    }

    const { data: finalizeData, error: finalizeErr } = await supabaseAdmin.rpc('finalize_order_dispatch', {
      p_order_id: orderId,
      p_claim_token: claimToken,
      p_shipment_details: {
        shiprocketOrderId,
        shipmentId,
        awbCode,
        courierName: courierName || 'Assigned Courier',
        courierId: courierId || undefined,
        trackingUrl: trackingUrl || (awbCode ? `https://shiprocket.co/tracking/${awbCode}` : ''),
        dispatchedAt: new Date().toISOString(),
        dispatchedBy: adminName,
      },
      p_target_shipping_status: targetShippingStatus,
      p_timeline_entry: {
        status: 'manifested',
        label: 'Shipment Manifested (Shiprocket)',
        description: `Assigned courier: ${courierName || 'Shiprocket'} | AWB: ${awbCode}`,
        timestamp: new Date().toISOString(),
        performedBy: adminName,
      },
    });

    if (finalizeErr || !finalizeData?.success) {
      console.error('[shiprocket-dispatch] Finalize RPC failed:', finalizeErr || finalizeData);
      return jsonResponse(
        {
          warning: 'Shipment manifested with Shiprocket, but database finalize confirmation failed.',
          error: finalizeErr?.message || finalizeData?.message,
          error_code: finalizeData?.error_code,
          shipment_id: shipmentId,
          awb_code: awbCode,
          courier_name: courierName,
          tracking_url: trackingUrl,
        },
        500
      );
    }

    // 15. Return structured JSON response
    return jsonResponse(
      {
        success: true,
        shipment_id: shipmentId,
        shiprocket_order_id: shiprocketOrderId,
        awb_code: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl,
        shipping_status: finalizeData?.shipping_status || targetShippingStatus || order.shipping_status,
        fulfillment_status: 'fulfilled',
      },
      200
    );
  } catch (err: any) {
    console.error('[shiprocket-dispatch] Execution failure:', err);
    return jsonResponse({ error: err.message || 'Internal logistics service error' }, 500);
  }
});
