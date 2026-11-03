// Supabase Edge Function: shiprocket-track
// Runs securely server-side on Deno / Supabase Edge Functions
// Authenticates requesting administrator, queries Shiprocket Courier Tracking API by AWB,
// normalizes tracking status & scan activities, synchronizes order status with the lifecycle state machine,
// deduplicates timeline events, and returns structured tracking history.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

// Server-side environment secrets
const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL') || '';
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD') || '';
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

// Allowed state transitions based on public.validate_order_status_transition()
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

// Map Shiprocket status string or numeric code to Funky Fox order status
function mapShiprocketToOrderStatus(rawStatus: string | number | undefined): string | null {
  if (!rawStatus) return null;
  const s = String(rawStatus).toUpperCase().trim();

  // Terminal / delivered / cancelled
  if (s === 'DELIVERED' || s === '7' || s === 'DLVD') return 'delivered';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === '8') return 'cancelled';
  if (s.includes('RTO') || s.includes('RETURN') || s === '13' || s === '14') return 'returned';

  // In transit & out for delivery
  if (s === 'OUT FOR DELIVERY' || s === '6' || s === 'OFD') return 'out_for_delivery';
  if (
    s === 'IN TRANSIT' ||
    s === 'SHIPPED' ||
    s === 'PICKED UP' ||
    s === 'OUT FOR PICKUP' ||
    s === 'PICKUP SCHEDULED' ||
    s === '4' ||
    s === '5'
  ) {
    return 'shipped';
  }
  if (s === 'PACKED' || s === '3') return 'packed';
  if (s === 'CONFIRMED' || s === '2') return 'confirmed';

  return null;
}

// Can transition status forward safely without illegal downgrade
function canTransitionStatus(currentStatus: string, targetStatus: string): boolean {
  if (currentStatus === targetStatus) return false;
  // Terminal states cannot be altered (except delivered -> returned)
  if (currentStatus === 'cancelled' || currentStatus === 'returned') return false;
  if (currentStatus === 'delivered' && targetStatus !== 'returned') return false;

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
  }

  try {
    // 1. Authenticate user JWT
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

    // 2. Authorize administrator
    const { data: isAdminRpc, error: rpcError } = await supabaseUser.rpc('is_admin');
    if (rpcError || isAdminRpc !== true) {
      return jsonResponse({ error: 'Forbidden: Administrative privileges required' }, 403);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('id, auth_user_id, email, name, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!adminRecord || !['super_admin', 'admin', 'manager'].includes(adminRecord.role)) {
      return jsonResponse({ error: 'Forbidden: Valid administrator role required' }, 403);
    }

    // 3. Validate Shiprocket credentials
    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return jsonResponse({ error: 'Server configuration error: Shiprocket credentials unset' }, 500);
    }

    // 4. Parse payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body' }, 400);
    }

    const orderId = (body?.order_id || body?.orderId || '').trim();
    let awbCode = (body?.awb_code || body?.awbCode || '').trim();

    let order: any = null;

    if (orderId) {
      const { data: o, error: oErr } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (oErr || !o) {
        return jsonResponse({ error: `Order "${orderId}" not found` }, 404);
      }

      order = o;
      if (!awbCode) {
        awbCode = order.shipment_details?.awbCode || '';
      }
    }

    if (!awbCode) {
      return jsonResponse(
        { error: 'Cannot track shipment: AWB code is missing or order is not yet manifested.' },
        400
      );
    }

    // 5. Query Shiprocket Courier Tracking API
    const token = await getShiprocketToken();
    const trackRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    const trackJson = await trackRes.json();

    if (!trackRes.ok) {
      return jsonResponse(
        {
          error: `Shiprocket tracking API failed (${trackRes.status}): ${JSON.stringify(trackJson)}`,
          awb_code: awbCode,
        },
        trackRes.status >= 500 ? 502 : 400
      );
    }

    const trackingData = trackJson.tracking_data || {};
    const trackActivitiesRaw: any[] = trackingData.shipment_track_activities || [];
    const shipmentTrackRaw: any = trackingData.shipment_track?.[0] || {};

    const rawStatus =
      shipmentTrackRaw.current_status ||
      trackingData.shipment_status ||
      (trackActivitiesRaw[0]?.activity) ||
      'UNKNOWN';

    const courierName = trackingData.courier_name || shipmentTrackRaw.courier_name || order?.shipment_details?.courierName || 'Assigned Courier';
    const trackingUrl = trackingData.track_url || `https://shiprocket.co/tracking/${awbCode}`;
    const etd = trackingData.etd || shipmentTrackRaw.etd || null;

    // Normalize activities chronologically (newest first)
    const normalizedActivities = trackActivitiesRaw.map((act) => ({
      date: act.date || act['sr-status-date'] || new Date().toISOString(),
      status: act.status || act['sr-status'] || '',
      activity: act.activity || act['sr-status-label'] || 'Status Update',
      location: act.location || '',
      raw_label: act['sr-status-label'] || act.activity || '',
    }));

    // 6. Synchronize into database if order was supplied
    let statusUpdated = false;
    let targetOrderStatus: string | null = null;

    if (order) {
      const mappedStatus = mapShiprocketToOrderStatus(rawStatus);

      // Check if valid state machine transition is permitted
      if (mappedStatus && canTransitionStatus(order.shipping_status, mappedStatus)) {
        targetOrderStatus = mappedStatus;
      }

      // Timeline event deduplication
      const currentTimeline: any[] = Array.isArray(order.timeline) ? order.timeline : [];
      const updatedTimeline = [...currentTimeline];

      // Add timeline event for each activity if not already present
      for (const act of normalizedActivities) {
        const eventLabel = `Tracking: ${act.activity}`;
        const eventTime = new Date(act.date).toISOString();

        const exists = currentTimeline.some(
          (t: any) =>
            (t.label === eventLabel && Math.abs(new Date(t.timestamp).getTime() - new Date(eventTime).getTime()) < 3600000) ||
            t.description?.includes(act.activity)
        );

        if (!exists) {
          updatedTimeline.push({
            status: act.status || 'in_transit',
            label: eventLabel,
            description: `${act.location ? `Location: ${act.location} · ` : ''}Courier: ${courierName}`,
            timestamp: eventTime,
            performedBy: 'Shiprocket Tracker',
          });
        }
      }

      const existingShipmentDetails = order.shipment_details || {};
      const updatedShipmentDetails = {
        ...existingShipmentDetails,
        courierName,
        awbCode,
        trackingUrl,
        etd: etd || existingShipmentDetails.etd,
        currentStatus: rawStatus,
        lastTrackedAt: new Date().toISOString(),
        trackingActivities: normalizedActivities.slice(0, 10), // Keep latest 10 activities in JSONB
      };

      const updatePayload: Record<string, unknown> = {
        shipment_details: updatedShipmentDetails,
        timeline: updatedTimeline,
        updated_at: new Date().toISOString(),
      };

      if (targetOrderStatus && targetOrderStatus !== order.shipping_status) {
        updatePayload.shipping_status = targetOrderStatus;
        if (targetOrderStatus === 'delivered') {
          updatePayload.fulfillment_status = 'fulfilled';
        }
        statusUpdated = true;
      }

      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);

      if (updateErr) {
        console.error('[shiprocket-track] Order update error:', updateErr);
      }
    }

    return jsonResponse({
      success: true,
      order_id: order?.id || null,
      awb_code: awbCode,
      courier_name: courierName,
      current_status: rawStatus,
      shipping_status: targetOrderStatus || order?.shipping_status || null,
      status_updated: statusUpdated,
      etd,
      tracking_url: trackingUrl,
      activities: normalizedActivities,
      last_tracked_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[shiprocket-track] Execution failure:', err);
    return jsonResponse({ error: err.message || 'Internal tracking service error' }, 500);
  }
});

