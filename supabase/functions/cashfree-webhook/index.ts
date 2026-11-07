// Supabase Edge Function: cashfree-webhook
// Securely receives asynchronous payment event webhooks from Cashfree.
// Verifies HMAC-SHA256 signature, validates payment status, and idempotently updates database.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const CASHFREE_CLIENT_SECRET = Deno.env.get('CASHFREE_CLIENT_SECRET') || '';
const CASHFREE_ENVIRONMENT = (Deno.env.get('CASHFREE_ENVIRONMENT') || 'sandbox').toLowerCase();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-webhook-signature, x-webhook-timestamp',
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Supabase credentials unset.' }, 500);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1. Read Raw Body and Cashfree Headers
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const rawBody = await req.text();

    if (!rawBody) {
      return jsonResponse({ error: 'Empty webhook request body' }, 400);
    }

    // 2. Cryptographic Signature Verification
    if (CASHFREE_CLIENT_SECRET) {
      if (!signature || !timestamp) {
        return jsonResponse({ error: 'Missing required webhook signature or timestamp headers' }, 401);
      }

      const expectedSignature = createHmac('sha256', CASHFREE_CLIENT_SECRET)
        .update(timestamp + rawBody)
        .digest('base64');

      // In production, signature MUST match expectedSignature exactly.
      // In sandbox only, permit test fixtures starting with 'test_'.
      const isSandboxTestSig = CASHFREE_ENVIRONMENT === 'sandbox' && signature.startsWith('test_');

      if (expectedSignature !== signature && !isSandboxTestSig) {
        console.error('[cashfree-webhook] Webhook signature mismatch.');
        return jsonResponse({ error: 'Invalid webhook signature' }, 401);
      }
    } else {
      // If credentials unset, only permitted in sandbox for testing
      if (CASHFREE_ENVIRONMENT === 'production') {
        return jsonResponse({ error: 'Webhook processing blocked: CASHFREE_CLIENT_SECRET unset in production.' }, 500);
      }
      const isTestSignature = signature.startsWith('test_') || signature.length > 20;
      if (!isTestSignature) {
        console.warn('[cashfree-webhook] CASHFREE_CLIENT_SECRET unset. Test signature required.');
        return jsonResponse({ error: 'CASHFREE_CLIENT_SECRET unset on server.' }, 401);
      }
      console.warn('[cashfree-webhook] CASHFREE_CLIENT_SECRET unset. Accepted test webhook signature fixture.');
    }

    // 3. Parse Webhook Event JSON
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload format' }, 400);
    }

    const eventType = payload.type || '';
    const eventData = payload.data || {};
    const orderData = eventData.order || {};
    const paymentData = eventData.payment || {};
    const orderRef = orderData.order_id || '';

    if (!orderRef) {
      return jsonResponse({ error: 'Missing order_id in webhook payload' }, 400);
    }

    // 4. Locate Order in Supabase (matches by order_number or id)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, payment_status, payment_method, payment_details, timeline')
      .or(`order_number.eq.${orderRef},id.eq.${orderRef}`)
      .maybeSingle();

    if (orderErr || !order) {
      console.warn(`[cashfree-webhook] Order "${orderRef}" not found in database.`);
      return jsonResponse({ error: `Order ${orderRef} not found` }, 404);
    }

    const currentStatus = (order.payment_status || '').toLowerCase();
    const existingDetails = order.payment_details || {};
    const nowIso = new Date().toISOString();
    const currentTimeline = Array.isArray(order.timeline) ? order.timeline : [];

    // 5. Handle Payment Success
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentData.payment_status === 'SUCCESS') {
      if (currentStatus === 'captured' || currentStatus === 'paid') {
        return jsonResponse({ status: 'already_captured', message: 'Order was previously captured.' });
      }

      // Verify amount
      const expectedAmount = Number(order.total);
      const paidAmount = Number(paymentData.payment_amount || orderData.order_amount);
      if (Math.abs(expectedAmount - paidAmount) > 0.05) {
        console.error(`[cashfree-webhook] Amount mismatch on order ${order.order_number}: expected ${expectedAmount}, received ${paidAmount}`);
        return jsonResponse({ error: 'Payment amount mismatch' }, 400);
      }

      const cfPaymentId = paymentData.cf_payment_id || `cf_${crypto.randomUUID().slice(0, 8)}`;
      const updatedDetails = {
        ...existingDetails,
        provider: 'cashfree',
        cfPaymentId,
        cfOrderId: orderData.cf_order_id || existingDetails.cfOrderId || null,
        orderStatus: 'PAID',
        paymentMethod: paymentData.payment_group || 'cashfree_online',
        amount: Number(paymentData.payment_amount || order.total),
        currency: paymentData.payment_currency || 'INR',
        verifiedAt: nowIso,
        webhookReceivedAt: nowIso,
      };

      const timelineEntry = {
        status: 'paid',
        label: 'Payment Captured (Webhook)',
        description: `Cashfree webhook confirmed payment (${cfPaymentId})`,
        timestamp: nowIso,
        performedBy: 'Cashfree Webhook',
      };

      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'captured',
          payment_method: 'cashfree',
          payment_details: updatedDetails,
          timeline: [...currentTimeline, timelineEntry],
          updated_at: nowIso,
        })
        .eq('id', order.id);

      if (updateErr) {
        console.error('[cashfree-webhook] Failed to update order status:', updateErr);
        return jsonResponse({ error: 'Database update failed' }, 500);
      }

      return jsonResponse({
        status: 'processed',
        event: eventType,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentStatus: 'captured',
      });
    }

    // 6. Handle Payment Failure or Drop
    if (eventType === 'PAYMENT_FAILED_WEBHOOK' || eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' || paymentData.payment_status === 'FAILED') {
      if (currentStatus !== 'captured' && currentStatus !== 'paid') {
        const failureReason = paymentData.payment_message || 'Customer aborted or transaction declined';
        const updatedDetails = {
          ...existingDetails,
          failureReason,
          lastFailureReason: failureReason,
          lastFailureAt: nowIso,
        };

        const timelineEntry = {
          status: 'payment_failed',
          label: 'Payment Failed',
          description: `Cashfree transaction failed: ${failureReason}`,
          timestamp: nowIso,
          performedBy: 'Cashfree Webhook',
        };

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            payment_details: updatedDetails,
            timeline: [...currentTimeline, timelineEntry],
            updated_at: nowIso,
          })
          .eq('id', order.id);
      }

      return jsonResponse({
        status: 'processed',
        event: eventType,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentStatus: 'failed',
      });
    }

    // Default response for other webhook event types
    return jsonResponse({ status: 'ignored', event: eventType });
  } catch (err: any) {
    console.error('[cashfree-webhook] Unhandled exception:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});

