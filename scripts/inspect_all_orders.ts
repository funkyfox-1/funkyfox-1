import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SECRET_KEY);

async function inspectAllOrders() {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, subtotal, customer_info, created_at, idempotency_key')
    .order('created_at', { ascending: false });

  console.log(`\nALL 10 ORDERS IN SUPABASE:`);
  orders?.forEach((o, idx) => {
    console.log(`  ${idx+1}. [${o.created_at}] Order #${o.order_number} (${o.id})`);
    console.log(`     Customer: ${(o.customer_info as any)?.name} (${(o.customer_info as any)?.email})`);
    console.log(`     Idempotency Key: "${o.idempotency_key}" | Total: ₹${o.total}`);
  });

  const { data: items } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, variant_id, name, size, color, quantity');

  console.log(`\nALL ORDER ITEMS (${items?.length}):`);
  items?.forEach(i => {
    console.log(`  - Item [${i.id}] in Order [${i.order_id}]: Prod "${i.product_id}" (${i.color}/${i.size}), Qty: ${i.quantity}`);
  });
}

inspectAllOrders();

