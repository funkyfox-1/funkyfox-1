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

const intended = JSON.parse(fs.readFileSync('scripts/intended_catalog_ids.json', 'utf-8'));
const intendedProdIds = new Set(intended.product_ids);
const intendedVarIds = new Set(intended.variant_ids);

const supabaseUrl = envVars.VITE_SUPABASE_URL || '';
const supabaseKey = envVars.SUPABASE_SECRET_KEY || envVars.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== AUDITING EXACT TEST RECORDS IN SUPABASE ===\n');

  // 1. Products
  const { data: dbProducts, error: pErr } = await supabase
    .from('products')
    .select('id, name, sku, category, status, total_stock, created_at');

  if (pErr) {
    console.error('Error fetching products:', pErr);
    return;
  }

  console.log(`Total Products in DB: ${dbProducts.length}`);
  const extraProducts = dbProducts.filter(p => !intendedProdIds.has(p.id));
  console.log(`Extra Products (${extraProducts.length}):`);
  extraProducts.forEach(p => {
    console.log(`  -> ID: "${p.id}" | Name: "${p.name}" | SKU: "${p.sku}" | Category: "${p.category}" | Stock: ${p.total_stock} | Created: ${p.created_at}`);
  });

  // 2. Product Variants (fetch in 2 batches of 1000)
  const { data: vars1 } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color_name, sku, stock, created_at')
    .range(0, 999);

  const { data: vars2 } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color_name, sku, stock, created_at')
    .range(1000, 1999);

  const allVars = [...(vars1 || []), ...(vars2 || [])];
  console.log(`\nTotal Variants in DB: ${allVars.length}`);

  const extraVars = allVars.filter(v => !intendedVarIds.has(v.id));
  console.log(`Extra Variants (${extraVars.length}):`);
  extraVars.forEach(v => {
    console.log(`  -> ID: "${v.id}" | Product: "${v.product_id}" | ${v.color_name} / ${v.size} | SKU: "${v.sku}" | Stock: ${v.stock}`);
  });

  // 3. Orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, subtotal, payment_method, payment_status, customer, created_at');

  console.log(`\nTotal Orders in DB: ${orders?.length || 0}`);
  orders?.forEach(o => {
    console.log(`  -> Order: "${o.order_number}" (${o.id}) | Total: ₹${o.total} | Method: ${o.payment_method} | Status: ${o.payment_status} | Customer: ${JSON.stringify(o.customer)} | Created: ${o.created_at}`);
  });

  // 4. Order Items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, variant_id, name, size, color, quantity, price');

  console.log(`\nTotal Order Items in DB: ${orderItems?.length || 0}`);
  orderItems?.forEach(oi => {
    console.log(`  -> OrderItem: "${oi.id}" | Order: "${oi.order_id}" | Prod: "${oi.product_id}" | Variant: "${oi.variant_id}" | Qty: ${oi.quantity} | Price: ₹${oi.price}`);
  });

  // 5. Customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, total_orders, total_spent, created_at');

  console.log(`\nTotal Customers in DB: ${customers?.length || 0}`);
  customers?.forEach(c => {
    console.log(`  -> Customer: "${c.id}" | Name: "${c.name}" | Email: "${c.email}" | Phone: "${c.phone}" | Orders: ${c.total_orders} | Created: ${c.created_at}`);
  });

  // 6. Inventory Logs
  const { data: invLogs } = await supabase
    .from('inventory_logs')
    .select('id, product_id, variant_id, previous_quantity, new_quantity, change, reason, note, created_at')
    .order('created_at', { ascending: false });

  console.log(`\nTotal Inventory Logs in DB: ${invLogs?.length || 0}`);
  invLogs?.forEach(il => {
    console.log(`  -> Log [${il.created_at}] Prod: "${il.product_id}" | Var: "${il.variant_id}" | Change: ${il.change} (${il.previous_quantity} -> ${il.new_quantity}) | Reason: ${il.reason} | Note: "${il.note}"`);
  });

  // 7. Check affected inventory of legitimate products
  console.log('\n=== INVENTORY RECONCILIATION FOR MODIFIED LEGITIMATE PRODUCTS ===');
  const targetProdId = 'modern-bandhgala-kurta';
  const { data: targetProd } = await supabase
    .from('products')
    .select('id, name, total_stock, product_variants(id, size, color_name, stock)')
    .eq('id', targetProdId)
    .single();

  if (targetProd) {
    console.log(`Product: "${targetProd.name}" Current Total Stock: ${targetProd.total_stock}`);
    targetProd.product_variants.forEach((v: any) => {
      console.log(`  - Variant "${v.id}" (${v.color_name} / ${v.size}): Current Stock = ${v.stock}`);
    });
  }
}

runAudit();

