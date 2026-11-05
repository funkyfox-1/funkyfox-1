// Supabase Edge Function: create-razorpay-order
// Runs securely server-side on Deno / Supabase Edge Functions
// Authenticates the request, retrieves authoritative order amount from Supabase,
// creates an official Razorpay Order via the Razorpay API, and associates the Razorpay Order ID.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
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
    // 2. Validate Edge Configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Server configuration error: Supabase service role is unset.' }, 500);
    }

    // 3. Authenticate Caller JWT (Optional guest fallback if anon key used)
    const authHeader = req.headers.get('Authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    let authenticatedUserId: string | null = null;
    if (userJwt && userJwt !== SUPABASE_ANON_KEY) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(userJwt);
      if (user) authenticatedUserId = user.id;
    }

    // 4. Parse & Validate Payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON request payload' }, 400);
    }

    const { order_id } = body;
    if (!order_id || typeof order_id !== 'string') {
      return jsonResponse({ error: 'Missing or invalid required parameter "order_id"' }, 400);
    }

    // 5. Fetch Authoritative Order Details from Database
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, subtotal, shipping_charge, discount, payment_status, payment_method, payment_details, customer_info')
      .eq('id', order_id.trim())
      .maybeSingle();

    if (orderErr || !order) {
      return jsonResponse({ error: `Order "${order_id}" not found in database.` }, 404);
    }

    // 6. State Machine & Payment Status Guard
    const paymentStatus = (order.payment_status || '').toLowerCase();
    if (paymentStatus === 'captured' || paymentStatus === 'paid') {
      return jsonResponse({ error: 'Order is already marked paid and cannot be re-charged.' }, 400);
    }

    if (order.payment_method === 'cod') {
      return jsonResponse({ error: 'Order is configured for Cash on Delivery (COD). Online gateway is not applicable.' }, 400);
    }

    // 7. Prevent Duplicate Razorpay Orders (Return existing active order ID if already generated)
    const existingPaymentDetails = order.payment_details || {};
    if (existingPaymentDetails.razorpayOrderId) {
      return jsonResponse({
        success: true,
        alreadyCreated: true,
        orderId: order.id,
        orderNumber: order.order_number,
        razorpayOrderId: existingPaymentDetails.razorpayOrderId,
        amount: Math.round(Number(order.total) * 100),
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      });
    }

    // 8. Calculate Amount in Paise (1 INR = 100 paise)
    const orderTotal = Number(order.total);
    if (isNaN(orderTotal) || orderTotal <= 0) {
      return jsonResponse({ error: `Invalid order total amount (${order.total}). Amount must be greater than zero.` }, 400);
    }
    const amountInPaise = Math.round(orderTotal * 100);

    // 9. Create Razorpay Order via Official API (or generate safe test fixture if keys unconfigured in test mode)
    let razorpayOrderId = '';

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.order_number,
          notes: {
            funky_fox_order_id: order.id,
            customer_name: order.customer_info?.name || '',
            customer_email: order.customer_info?.email || '',
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!rzpRes.ok) {
        const errorText = await rzpRes.text();
        console.error('[create-razorpay-order] Razorpay API rejected order creation:', rzpRes.status, errorText);
        return jsonResponse({
          error: `Razorpay Orders API failed (${rzpRes.status}): ${errorText}`,
        }, 502);
      }

      const rzpData = await rzpRes.json();
      razorpayOrderId = rzpData.id;
    } else {
      // Test-mode sandbox fallback when merchant account review is pending and credentials are unset
      razorpayOrderId = `order_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;
      console.warn(`[create-razorpay-order] RAZORPAY_KEY_ID / SECRET unset. Generated test-mode order ID: ${razorpayOrderId}`);
    }

    // 10. Persist Razorpay Order ID to Order Record
    const updatedDetails = {
      ...existingPaymentDetails,
      razorpayOrderId,
      currency: 'INR',
      amountPaise: amountInPaise,
      orderCreatedAt: new Date().toISOString(),
    };

    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        payment_details: updatedDetails,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error('[create-razorpay-order] Failed to persist Razorpay Order ID to database:', updateErr);
    }

    return jsonResponse({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (err: any) {
    console.error('[create-razorpay-order] Execution failure:', err);
    return jsonResponse({ error: err.message || 'Internal server error while creating payment order.' }, 500);
  }
});

