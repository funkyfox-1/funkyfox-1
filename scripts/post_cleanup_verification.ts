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

async function verifyDatabase() {
  console.log('====================================================');
  console.log('RUNNING TASK 5: POST-CLEANUP VERIFICATION');
  console.log('====================================================\n');

  const intendedIds = JSON.parse(fs.readFileSync('scripts/intended_catalog_ids.json', 'utf-8'));

  // 1. Products
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, total_stock, status, category_id');
  if (prodErr) {
    console.error('Product error:', prodErr);
  }
  console.log(`1. Products count: ${products?.length} (Expected: 158)`);
  if (products?.length !== 158) {
    console.error(`  FAIL: Product count mismatch!`);
  } else {
    console.log(`  PASS: Exactly 158 products present.`);
  }

  // Check product IDs match intended
  const dbProdIds = new Set(products?.map(p => p.id));
  const missingProds = intendedIds.product_ids.filter((id: string) => !dbProdIds.has(id));
  const extraProds = products?.filter(p => !intendedIds.product_ids.includes(p.id)).map(p => p.id);
  console.log(`  Missing intended products: ${missingProds.length}`);
  console.log(`  Extra un-intended products: ${extraProds?.length}`);

  // 2. Variants
  const { data: page1 } = await supabase.from('product_variants').select('id, product_id, stock').range(0, 999);
  const { data: page2 } = await supabase.from('product_variants').select('id, product_id, stock').range(1000, 1999);
  const allVariants = [...(page1 || []), ...(page2 || [])];
  console.log(`\n2. Product Variants count: ${allVariants.length} (Expected: 1336)`);
  if (allVariants.length !== 1336) {
    console.error(`  FAIL: Variant count mismatch!`);
  } else {
    console.log(`  PASS: Exactly 1,336 variants present.`);
  }

  const dbVarIds = new Set(allVariants.map(v => v.id));
  const missingVars = intendedIds.variant_ids.filter((id: string) => !dbVarIds.has(id));
  const extraVars = allVariants.filter(v => !intendedIds.variant_ids.includes(v.id)).map(v => v.id);
  console.log(`  Missing intended variants: ${missingVars.length}`);
  console.log(`  Extra un-intended variants: ${extraVars.length}`);

  // 3. Variant Stock Consistency
  const non15 = allVariants.filter(v => v.stock !== 15);
  console.log(`\n3. Variants with stock !== 15: ${non15.length} (Expected: 0)`);
  if (non15.length === 0) {
    console.log(`  PASS: Every single variant has exactly 15 units of stock!`);
    console.log(`  Total catalog variant stock: ${allVariants.length * 15} units.`);
  } else {
    console.error(`  FAIL: Found variants with unexpected stock:`, non15);
  }

  // 4. Product total_stock vs sum(variant.stock)
  const variantSumByProd: Record<string, number> = {};
  allVariants.forEach(v => {
    variantSumByProd[v.product_id] = (variantSumByProd[v.product_id] || 0) + v.stock;
  });

  const sumMismatches = products?.filter(p => p.total_stock !== (variantSumByProd[p.id] || 0));
  console.log(`\n4. Products with total_stock mismatch: ${sumMismatches?.length} (Expected: 0)`);
  if (sumMismatches?.length === 0) {
    console.log(`  PASS: 100% of products have total_stock perfectly matching variant stock sums!`);
  } else {
    console.error(`  FAIL: Found products with total_stock mismatch:`, sumMismatches);
  }

  // 5. Categories
  const { data: categories } = await supabase.from('categories').select('id, name');
  console.log(`\n5. Categories count: ${categories?.length} (Expected: 4)`);
  categories?.forEach(c => console.log(`  - ${c.name} (${c.id})`));

  // 6. Orders
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log(`\n6. Orders count: ${orderCount} (Expected: 0)`);

  // 7. Order Items
  const { count: itemCount } = await supabase.from('order_items').select('*', { count: 'exact', head: true });
  console.log(`7. Order Items count: ${itemCount} (Expected: 0)`);

  // 8. Customers
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
  console.log(`8. Test Customers count: ${customerCount} (Expected: 0)`);

  // 9. Inventory Logs
  const { count: logCount } = await supabase.from('inventory_logs').select('*', { count: 'exact', head: true });
  console.log(`9. Inventory Logs count: ${logCount} (Expected: 0)`);

  // 10. Admin Users
  const { data: adminUsers } = await supabase.from('admin_users').select('email, role, name');
  console.log(`10. Admin Users count: ${adminUsers?.length} (Expected: 1)`);
  adminUsers?.forEach(a => console.log(`  - ${a.name} <${a.email}> (${a.role})`));

  // 11. Audit Logs
  const { data: auditLogs } = await supabase.from('audit_logs').select('action, details');
  console.log(`11. Audit Logs count: ${auditLogs?.length} (Expected: 2 legitimate banner updates)`);
  auditLogs?.forEach(a => console.log(`  - ${a.action}: ${a.details}`));

  console.log('\n====================================================');
  console.log('POST-CLEANUP VERIFICATION COMPLETED');
  console.log('====================================================\n');
}

verifyDatabase();
