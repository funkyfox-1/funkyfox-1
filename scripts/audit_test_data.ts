import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read .env.local manually
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

const supabaseUrl = envVars.VITE_SUPABASE_URL || '';
// Use admin/secret key for audit if available, else anon key
const supabaseKey = envVars.SUPABASE_SECRET_KEY || envVars.VITE_SUPABASE_ANON_KEY || '';

console.log('=== STEP 1: DETAILED AUDIT OF REMOTE DATABASE TEST RECORDS ===');
console.log('Target URL:', supabaseUrl);
console.log('Using Admin/Secret Key?', !!envVars.SUPABASE_SECRET_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabase() {
  // 1. Fetch all products in Supabase
  const { data: allDbProducts, error: prodErr } = await supabase
    .from('products')
    .select('id, name, sku, category, status, total_stock, created_at, updated_at');

  if (prodErr) {
    console.error('Error fetching products:', prodErr);
    return;
  }

  // Read clean 158 catalog product IDs from build_clean_catalog.py or seed.sql
  const seedSql = fs.readFileSync('supabase/seed.sql', 'utf-8');
  // Match: INSERT INTO public.products ( ... VALUES ( 'id',
  const seedProductIds = new Set<string>();
  const seedProductRegex = /\(\s*'([a-z0-9\-]+)'\s*,\s*'([a-z0-9\-]+)'/g;
  let match;
  while ((match = seedProductRegex.exec(seedSql)) !== null) {
    if (match[1] && !match[1].startsWith('t-') && !match[1].startsWith('cat_') && match[1] !== 'jackets' && match[1] !== 'shirts' && match[1] !== 'trousers-jeans') {
      seedProductIds.add(match[1]);
    }
  }

  console.log(`\nTotal products in remote Supabase: ${allDbProducts?.length}`);
  console.log(`Expected catalog products from seed.sql: ${seedProductIds.size}`);

  const extraProducts = allDbProducts?.filter(p => !seedProductIds.has(p.id)) || [];
  console.log(`\nEXTRA / UNMATCHED PRODUCTS (${extraProducts.length}):`);
  extraProducts.forEach(p => {
    console.log(`  - ID: "${p.id}", Name: "${p.name}", SKU: "${p.sku}", Category: "${p.category}", Stock: ${p.total_stock}, Created: ${p.created_at}`);
  });

  // 2. Fetch all product_variants for extra products
  const { data: allVariants } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color_name, sku, stock, created_at');

  console.log(`\nTotal variants in remote Supabase: ${allVariants?.length}`);
  // Variants belonging to extra products
  const extraProductIds = new Set(extraProducts.map(p => p.id));
  const variantsOfExtraProducts = allVariants?.filter(v => extraProductIds.has(v.product_id)) || [];
  console.log(`Variants belonging to extra products (${variantsOfExtraProducts.length}):`);
  variantsOfExtraProducts.forEach(v => {
    console.log(`  - Variant ID: "${v.id}" (Prod: "${v.product_id}", Size: "${v.size}", Color: "${v.color_name}", Stock: ${v.stock})`);
  });

  // Are there other unmatched variants?
  const seedVariantRegex = /\(\s*'([a-z0-9\-]+)'\s*,\s*'([a-z0-9\-]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)/g;
  const seedVariantIds = new Set<string>();
  while ((match = seedVariantRegex.exec(seedSql)) !== null) {
    seedVariantIds.add(match[1]);
  }
  console.log(`Expected variants in seed.sql: ${seedVariantIds.size}`);

  const extraVariantsOverall = allVariants?.filter(v => !seedVariantIds.has(v.id)) || [];
  console.log(`Extra variants overall not in seed.sql (${extraVariantsOverall.length}):`);
  extraVariantsOverall.forEach(v => {
    console.log(`  - ID: "${v.id}" (Prod: "${v.product_id}", ${v.color_name}/${v.size}, Stock: ${v.stock})`);
  });

  // 3. Inspect Orders
  const { data: orders, count: orderCount } = await supabase
    .from('orders')
    .select('id, order_number, total, subtotal, payment_method, payment_status, shipping_address, customer, created_at', { count: 'exact' });

  console.log(`\nTotal orders in remote Supabase: ${orderCount !== null ? orderCount : orders?.length}`);
  if (orders && orders.length > 0) {
    orders.forEach(o => {
      console.log(`  - Order ${o.order_number} (${o.id}): Total=₹${o.total}, Method=${o.payment_method}, Status=${o.payment_status}, Customer=${JSON.stringify(o.customer)}, Created=${o.created_at}`);
    });
  }

  // 4. Inspect Order Items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, variant_id, name, size, color, quantity, price');

  console.log(`\nTotal order_items in remote Supabase: ${orderItems?.length}`);
  if (orderItems && orderItems.length > 0) {
    orderItems.forEach(oi => {
      console.log(`  - Item [${oi.id}] Order: "${oi.order_id}", Prod: "${oi.product_id}", Size: "${oi.size}", Qty: ${oi.quantity}, Price: ₹${oi.price}`);
    });
  }

  // 5. Inspect Inventory Logs
  const { data: invLogs } = await supabase
    .from('inventory_logs')
    .select('id, product_id, variant_id, previous_quantity, new_quantity, change, reason, note, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  console.log(`\nRecent inventory logs (${invLogs?.length}):`);
  if (invLogs && invLogs.length > 0) {
    invLogs.forEach(il => {
      console.log(`  - [${il.created_at}] Prod: "${il.product_id}", Change: ${il.change} (${il.previous_quantity} -> ${il.new_quantity}), Reason: ${il.reason}, Note: "${il.note}"`);
    });
  }

  // 6. Inspect Customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, total_orders, total_spent, created_at');

  console.log(`\nTotal customers in remote Supabase: ${customers?.length}`);
  if (customers && customers.length > 0) {
    customers.forEach(c => {
      console.log(`  - Customer [${c.id}] Name: "${c.name}", Email: "${c.email}", Orders: ${c.total_orders}, Spent: ₹${c.total_spent}, Created: ${c.created_at}`);
    });
  }
}

auditDatabase();

