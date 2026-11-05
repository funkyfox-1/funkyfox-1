const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const getEnv = (k) => (envContent.match(new RegExp('^' + k + '\\s*=\\s*["\']?([^"\'\\r\\n]+)["\']?', 'm')) || [])[1];

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');

const client = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function check() {
  console.log('--- CHECKING DATABASE ORDERS ---');
  const { data: orders, error: ordersErr } = await client
    .from('orders')
    .select('id, order_number, payment_method, payment_status, shipping_status, fulfillment_status, created_at, shipment_details');

  if (ordersErr) {
    console.error('Orders error:', ordersErr);
    return;
  }
  console.log(`Total orders in DB: ${orders.length}`);
  orders.forEach(o => {
    console.log(`- ${o.order_number} (${o.id}): method=${o.payment_method}, pay=${o.payment_status}, ship=${o.shipping_status}, ful=${o.fulfillment_status}, awb=${o.shipment_details?.awbCode || 'none'}`);
  });

  console.log('\n--- CHECKING PRODUCT STOCK ---');
  const { data: products, error: prodErr } = await client
    .from('products')
    .select('*')
    .limit(1);

  if (prodErr) {
    console.error('Products error:', prodErr);
    return;
  }
  if (products && products[0]) {
    console.log('Product columns:', Object.keys(products[0]));
    console.log(`- Product: ${products[0].name || products[0].title || products[0].id}`);
  }
}

check();
