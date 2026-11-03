// Supabase Edge Function: shipment-webhook
// Secure incoming webhook endpoint for real-time Shiprocket tracking updates.
// Authenticates incoming requests via secret security token in headers (x-api-key).
// Validates order existence, maps courier status safely according to the state machine,
// prevents backwards transitions on terminal orders, deduplicates timeline events,
// and saves normalized tracking details.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SHIPROCKET_WEBHOOK_SECRET = Deno.env.get('SHIPROCKET_WEBHOOK_SECRET') || '';

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

function mapShiprocketToOrderStatus(rawStatus: string | number | undefined): string | null {
  if (!rawStatus) return null;
  const s = String(rawStatus).toUpperCase().trim();

  if (s === 'DELIVERED' || s === '7' || s === 'DLVD') return 'delivered';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === '8') return 'cancelled';
  if (s.includes('RTO') || s.includes('RETURN') || s === '13' || s === '14') return 'returned';
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

function canTransitionStatus(currentStatus: string, targetStatus: string): boolean {
  if (currentStatus === targetStatus) return false;
  if (currentStatus === 'cancelled' || currentStatus === 'returned') return false;
  if (currentStatus === 'delivered' && targetStatus !== 'returned') return false;

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // 2. Authenticate Webhook Request
    // Shiprocket sends configured Security Token in x-api-key header
    const incomingToken = req.headers.get('x-api-key') || req.headers.get('x-webhook-token') || '';

    if (!SHIPROCKET_WEBHOOK_SECRET || incomingToken !== SHIPROCKET_WEBHOOK_SECRET) {
      console.warn('[shipment-webhook] Unauthorized attempt: Invalid or missing webhook token');
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid webhook token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 3. Parse Webhook Payload
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
    }

    const awbCode = (payload.awb || payload.awb_code || payload.awbCode || '').trim();
    const orderNumber = (payload.order_id || payload.order_number || payload.channel_order_id || '').trim();
    const currentStatus = payload.current_status || payload.shipment_status || payload.status || '';
    const courierName = payload.courier_name || payload.courier || '';
    const location = payload.location || payload.current_location || '';
    const activity = payload.activity || payload.scans?.[0]?.activity || currentStatus;
    const scanDate = payload.date || payload.scans?.[0]?.date || new Date().toISOString();

    if (!awbCode && !orderNumber) {
      return new Response(JSON.stringify({ error: 'Payload missing AWB or Order Number' }), { status: 400 });
    }

    // 4. Look up Order in Supabase
    let query = supabaseAdmin.from('orders').select('*');
    if (awbCode) {
      query = query.eq('shipment_details->>awbCode', awbCode);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data: order, error: orderErr } = await query.maybeSingle();

    if (orderErr) {
      console.error('[shipment-webhook] DB query error:', orderErr);
      return new Response(JSON.stringify({ error: orderErr.message }), { status: 500 });
    }

    if (!order) {
      // Return 200 so Shiprocket does not keep retrying for orders outside our database
      return new Response(
        JSON.stringify({ message: 'Order not found in Funky Fox database; webhook acknowledged' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. State Machine & Timeline Processing
    const mappedStatus = mapShiprocketToOrderStatus(currentStatus);
    const targetStatus = mappedStatus && canTransitionStatus(order.shipping_status, mappedStatus) ? mappedStatus : null;

    // Timeline deduplication
    const currentTimeline: any[] = Array.isArray(order.timeline) ? order.timeline : [];
    const updatedTimeline = [...currentTimeline];
    const eventLabel = `Tracking: ${activity || currentStatus}`;
    const eventTime = new Date(scanDate).toISOString();

    const exists = currentTimeline.some(
      (t: any) =>
        (t.label === eventLabel && Math.abs(new Date(t.timestamp).getTime() - new Date(eventTime).getTime()) < 3600000) ||
        t.description?.includes(activity)
    );

    if (!exists && activity) {
      updatedTimeline.push({
        status: mappedStatus || 'in_transit',
        label: eventLabel,
        description: `${location ? `Location: ${location} · ` : ''}Courier: ${courierName || order.shipment_details?.courierName || 'Shiprocket'}`,
        timestamp: eventTime,
        performedBy: 'Shiprocket Webhook',
      });
    }

    const existingShipmentDetails = order.shipment_details || {};
    const updatedShipmentDetails = {
      ...existingShipmentDetails,
      awbCode: awbCode || existingShipmentDetails.awbCode,
      courierName: courierName || existingShipmentDetails.courierName,
      currentStatus: currentStatus || existingShipmentDetails.currentStatus,
      lastWebhookAt: new Date().toISOString(),
    };

    const updatePayload: Record<string, unknown> = {
      shipment_details: updatedShipmentDetails,
      timeline: updatedTimeline,
      updated_at: new Date().toISOString(),
    };

    if (targetStatus && targetStatus !== order.shipping_status) {
      updatePayload.shipping_status = targetStatus;
      if (targetStatus === 'delivered') {
        updatePayload.fulfillment_status = 'fulfilled';
      }
    }

    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (updateErr) {
      console.error('[shipment-webhook] Order update error:', updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: true,
        order_id: order.id,
        order_number: order.order_number,
        shipping_status: targetStatus || order.shipping_status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[shipment-webhook] Execution failure:', err);
    return new Response(JSON.stringify({ error: err.message || 'Webhook processing error' }), { status: 500 });
  }
});

