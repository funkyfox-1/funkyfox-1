// Supabase Edge Function: verify-razorpay
// Runs securely server-side on Deno / Supabase Edge Functions
// Validates Razorpay Webhook and Payment signatures without exposing secret to browser

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature',
      },
    });
  }

  try {
    if (!RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: 'Server configuration error: RAZORPAY_KEY_SECRET is unset' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required Razorpay payment confirmation fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify cryptographic signature: HMAC SHA256 of order_id + "|" + payment_id
    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ verified: false, error: 'Cryptographic signature mismatch' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update verified order payment record in Supabase using service role client
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && order_id) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error: dbError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'captured',
          payment_details: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id);

      if (dbError) {
        console.error('Failed to update order payment in Supabase:', dbError);
      }
    }

    return new Response(
      JSON.stringify({
        verified: true,
        message: 'Payment verified and captured successfully.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
