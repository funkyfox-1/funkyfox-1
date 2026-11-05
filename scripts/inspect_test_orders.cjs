const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return match ? match[1].trim() : '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');

const client = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function run() {
  const { data, error } = await client
    .from('orders')
    .select('id, order_number, payment_method, payment_status, shipping_status, fulfillment_status, created_at, shipping_address, shipment_details, items:order_items(*)')
    .in('id', [
      'ord_38663a7f3459473193d512a6e729472e',
      'ord_bf5b3cbca1fe475ab369c3296ffa736e',
      'ord_3238ada1ebf44e368563ecce8cceb58d'
    ]);
  
  if (error) {
    console.error('Error querying orders:', error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

run();
