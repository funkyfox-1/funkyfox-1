// Supabase Edge Function: shiprocket-dispatch
// Runs securely server-side on Deno / Supabase Edge Functions
// Authenticates with Shiprocket API, manifests shipment, and generates AWB

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL') || '';
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function getShiprocketToken(): Promise<string> {
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shiprocket auth failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.token;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return new Response(
        JSON.stringify({
          error: 'Shiprocket credentials missing. Define SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, courier_id, weight } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Authenticate with Shiprocket
    const token = await getShiprocketToken();

    // 2. Fetch order details from Supabase using service-role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found in database' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Create custom order payload in Shiprocket
    const createOrderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_date: new Date(order.created_at).toISOString().split('T')[0],
        pickup_location: 'Primary Warehouse Mumbai',
        billing_customer_name: order.shipping_address.fullName,
        billing_last_name: '',
        billing_address: order.shipping_address.street,
        billing_city: order.shipping_address.city,
        billing_pincode: order.shipping_address.pincode,
        billing_state: order.shipping_address.state,
        billing_country: 'India',
        billing_email: order.customer_info?.email || 'customer@funkyfox.in',
        billing_phone: order.shipping_address.phone,
        shipping_is_billing: true,
        order_items: (order.order_items || []).map((it: any) => ({
          name: it.name,
          sku: it.sku,
          units: it.quantity,
          selling_price: it.price,
        })),
        payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
        sub_total: order.total,
        length: 15,
        breadth: 12,
        height: 5,
        weight: parseFloat(weight) || 0.5,
      }),
    });

    const createOrderData = await createOrderRes.json();

    if (!createOrderRes.ok) {
      return new Response(JSON.stringify({ error: createOrderData }), {
        status: createOrderRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const shipmentId = createOrderData.shipment_id;

    // 4. Generate AWB
    let awbCode = '';
    let courierName = '';
    if (shipmentId) {
      const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_id: courier_id || undefined,
        }),
      });

      const awbData = await awbRes.json();
      if (awbData.response?.data) {
        awbCode = awbData.response.data.awb_code;
        courierName = awbData.response.data.courier_name;
      }
    }

    // 5. Update Order in Supabase
    await supabaseAdmin
      .from('orders')
      .update({
        shipping_status: 'shipped',
        shipment_details: {
          shiprocketOrderId: createOrderData.order_id,
          shipmentId: shipmentId,
          awbCode: awbCode,
          courierName: courierName || 'Assigned Courier',
          trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : '',
          dispatchedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({
        success: true,
        shipment_id: shipmentId,
        awb_code: awbCode,
        courier_name: courierName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Logistics API failure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
