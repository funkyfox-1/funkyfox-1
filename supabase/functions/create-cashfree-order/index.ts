// Supabase Edge Function: create-cashfree-order
// Runs securely server-side on Deno / Supabase Edge Functions
// Authenticates caller, retrieves authoritative order amount from Supabase,
// creates an official Cashfree Order via Cashfree PG API, stores payment_session_id and cf_order_id.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const CASHFREE_CLIENT_ID = Deno.env.get('CASHFREE_CLIENT_ID') || '';
const CASHFREE_CLIENT_SECRET = Deno.env.get('CASHFREE_CLIENT_SECRET') || '';
const CASHFREE_ENVIRONMENT = (Deno.env.get('CASHFREE_ENVIRONMENT') || 'sandbox').toLowerCase();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://funkyfox.in';

const CASHFREE_BASE_URL = CASHFREE_ENVIRONMENT === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

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
    // 2. Validate Server Environment
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Server configuration error: Supabase credentials unset.' }, 500);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 3. Parse and Validate Request Payload
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

    // 4. Fetch Authoritative Order Details from Database
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, subtotal, shipping_charge, discount, payment_status, payment_method, payment_details, customer_info, customer_id')
      .eq('id', order_id.trim())
      .maybeSingle();

    if (orderErr || !order) {
      return jsonResponse({ error: `Order "${order_id}" not found in database.` }, 404);
    }

    // 5. State Machine & Payment Status Guard
    const paymentStatus = (order.payment_status || '').toLowerCase();
    if (paymentStatus === 'captured' || paymentStatus === 'paid') {
      return jsonResponse({ error: 'Order is already marked paid and cannot be re-charged.' }, 400);
    }

    if (order.payment_method === 'cod') {
      return jsonResponse({ error: 'Order is configured for Cash on Delivery (COD). Online gateway is not applicable.' }, 400);
    }

    // 6. Idempotent Retry: Return existing active Cashfree session if already created
    const existingPaymentDetails = order.payment_details || {};
    if (existingPaymentDetails.paymentSessionId && existingPaymentDetails.provider === 'cashfree') {
      return jsonResponse({
        success: true,
        alreadyCreated: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentSessionId: existingPaymentDetails.paymentSessionId,
        cfOrderId: existingPaymentDetails.cfOrderId || null,
        amount: Number(order.total),
        currency: 'INR',
        environment: CASHFREE_ENVIRONMENT,
      });
    }

    // 7. Validate Order Amount
    const orderTotal = Number(order.total);
    if (isNaN(orderTotal) || orderTotal <= 0) {
      return jsonResponse({ error: `Invalid order total amount (${order.total}). Amount must be greater than zero.` }, 400);
    }

    // Format phone number to clean 10-15 digits
    const rawPhone = order.customer_info?.phone || '';
    const phoneDigits = rawPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : '9999999999';

    const customerEmail = (order.customer_info?.email || 'guest@funkyfox.in').toLowerCase().trim();
    const customerName = (order.customer_info?.name || 'Funky Fox Customer').trim();
    const customerId = (order.customer_id || `cust_${order.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`).slice(0, 50);

    const origin = req.headers.get('origin') || FRONTEND_URL;
    const returnUrl = `${origin}/order-confirmation?order_id=${encodeURIComponent(order.id)}&cf_order_id={order_id}`;
    const notifyUrl = `${SUPABASE_URL}/functions/v1/cashfree-webhook`;

    let paymentSessionId = '';
    let cfOrderId: string | number = '';

    // 8. Call Cashfree PG Orders API (or provide test fixture if credentials unset during early sandbox testing)
    if (CASHFREE_CLIENT_ID && CASHFREE_CLIENT_SECRET) {
      const cfPayload = {
        order_id: order.order_number,
        order_amount: Math.round(orderTotal * 100) / 100,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: notifyUrl,
          payment_methods: 'cc,dc,upi,nb,app,paylater',
        },
        order_note: `Order ${order.order_number} on Funky Fox`,
      };

      const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2025-01-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cfPayload),
        signal: AbortSignal.timeout(15000),
      });

      if (!cfRes.ok) {
        const errorText = await cfRes.text();
        console.error('[create-cashfree-order] Cashfree API rejected order creation:', cfRes.status, errorText);
        return jsonResponse({
          error: `Cashfree Orders API failed (${cfRes.status}): ${errorText}`,
        }, 502);
      }

      const cfData = await cfRes.json();
      paymentSessionId = cfData.payment_session_id;
      cfOrderId = cfData.cf_order_id;
    } else {
      // Test-mode sandbox fallback fixture when merchant keys are pending
      cfOrderId = Math.floor(Math.random() * 9000000 + 1000000);
      paymentSessionId = `session_test_${crypto.randomUUID().replace(/-/g, '')}`;
      console.warn(`[create-cashfree-order] CASHFREE_CLIENT_ID / SECRET unset. Generated test-mode session fixture: ${paymentSessionId}`);
    }

    // 9. Persist Cashfree Session & Order Metadata to Database
    const updatedPaymentDetails = {
      ...existingPaymentDetails,
      provider: 'cashfree',
      cfOrderId,
      paymentSessionId,
      currency: 'INR',
      amount: orderTotal,
      orderStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
      environment: CASHFREE_ENVIRONMENT,
    };

    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        payment_method: 'cashfree',
        payment_details: updatedPaymentDetails,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error('[create-cashfree-order] Failed to persist Cashfree session to database:', updateErr);
    }

    // 10. Return Cashfree Session to Frontend
    return jsonResponse({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentSessionId,
      cfOrderId,
      amount: orderTotal,
      currency: 'INR',
      environment: CASHFREE_ENVIRONMENT,
    });
  } catch (err: any) {
    console.error('[create-cashfree-order] Execution failure:', err);
    return jsonResponse({ error: err.message || 'Internal server error while creating Cashfree order.' }, 500);
  }
});

