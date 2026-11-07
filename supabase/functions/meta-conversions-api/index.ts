// Supabase Edge Function: meta-conversions-api
// Securely proxies server-side eCommerce conversions to Meta Conversions API (CAPI)
// Encrypts/hashes user data (SHA-256) per Meta specifications and deduplicates with browser pixel via event_id.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createHash } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID') || '';
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
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

function sha256(value: string): string {
  return createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
  }

  try {
    const body = await req.json();
    const {
      event_name = 'Purchase',
      event_id,
      event_time = Math.floor(Date.now() / 1000),
      order_id,
      order_number,
      total,
      currency = 'INR',
      customer_email,
      customer_phone,
      items = [],
    } = body;

    if (!event_id) {
      return jsonResponse({ error: 'Missing required field "event_id"' }, 400);
    }

    // 1. Prepare User Data (Hashed for privacy)
    const userData: Record<string, string[]> = {};
    if (customer_email) {
      userData.em = [sha256(customer_email)];
    }
    if (customer_phone) {
      const sanitizedPhone = customer_phone.replace(/[^0-9]/g, '');
      if (sanitizedPhone) {
        userData.ph = [sha256(sanitizedPhone)];
      }
    }

    // Extract client IP and User-Agent if available from request headers
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    const userAgent = req.headers.get('user-agent');
    if (clientIp) (userData as any).client_ip_address = clientIp.split(',')[0].trim();
    if (userAgent) (userData as any).client_user_agent = userAgent;

    // 2. Prepare Custom Data
    const customData = {
      value: Number(total || 0),
      currency,
      order_id: order_number || order_id,
      content_type: 'product',
      contents: Array.isArray(items)
        ? items.map((it: any) => ({
            id: it.id || it.productId,
            quantity: it.quantity || 1,
            item_price: Number(it.price || 0),
          }))
        : [],
    };

    // 3. Meta Conversions API Payload
    const capiPayload = {
      data: [
        {
          event_name,
          event_time,
          event_id,
          action_source: 'website',
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    // If Meta Access Token is unconfigured (e.g. sandbox or pending merchant token setup),
    // acknowledge cleanly without throwing
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.log('[meta-conversions-api] Notice: META_PIXEL_ID or META_ACCESS_TOKEN unset in Supabase secrets. Dry-run mode acknowledged.');
      return jsonResponse({
        success: true,
        mode: 'dry-run',
        message: 'Event logged; Meta credentials not yet set in Supabase secrets.',
        event_id,
      });
    }

    // 4. Dispatch to Meta Graph API
    const metaGraphUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(META_PIXEL_ID)}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`;
    const metaRes = await fetch(metaGraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(capiPayload),
      signal: AbortSignal.timeout(10000),
    });

    const metaResult = await metaRes.json();
    if (!metaRes.ok) {
      console.warn('[meta-conversions-api] Meta Graph API returned non-200:', metaRes.status, metaResult);
      return jsonResponse({
        success: false,
        status: metaRes.status,
        error: metaResult,
      }, 502);
    }

    return jsonResponse({
      success: true,
      events_received: metaResult.events_received,
      fbtrace_id: metaResult.fbtrace_id,
      event_id,
    });
  } catch (err: any) {
    console.error('[meta-conversions-api] Internal error:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});
