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
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_PUBLISHABLE_KEY || '';

console.log('=== SUPABASE CONNECTION & DATABASE VERIFICATION ===');
console.log('Target URL:', supabaseUrl);
console.log('Key available?', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials not found in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabase() {
  try {
    // 1. Query products
    const { data: productsData, error: prodErr, count: prodCount } = await supabase
      .from('products')
      .select('id, name, sku, category, status, total_stock', { count: 'exact' });

    if (prodErr) {
      console.error('[Database Error] Failed to fetch products:', prodErr);
    } else {
      console.log(`\n1. ACTUAL PRODUCTS IN SUPABASE: count=${prodCount}, returnedRows=${productsData?.length}`);
      if (productsData && productsData.length > 0) {
        console.log('Sample Products (first 5):');
        productsData.slice(0, 5).forEach((p, idx) => {
          console.log(`  ${idx + 1}. [${p.id}] "${p.name}" (Status: ${p.status}, Category: ${p.category}, Stock: ${p.total_stock})`);
        });
        if (productsData.length > 5) {
          console.log(`  ... and ${productsData.length - 5} more.`);
        }
      } else {
        console.log('  ⚠️ products table is EMPTY in remote Supabase!');
      }
    }

    // 2. Query product_variants
    const { data: variantsData, error: varErr, count: varCount } = await supabase
      .from('product_variants')
      .select('id, product_id, size, color_name, sku, stock, in_stock', { count: 'exact' });

    if (varErr) {
      console.error('\n[Database Error] Failed to fetch product_variants:', varErr);
    } else {
      console.log(`\n2. ACTUAL PRODUCT_VARIANTS IN SUPABASE: count=${varCount}, returnedRows=${variantsData?.length}`);
      if (variantsData && variantsData.length > 0) {
        console.log('Sample Variants (first 5):');
        variantsData.slice(0, 5).forEach((v, idx) => {
          console.log(`  ${idx + 1}. [${v.id}] Prod: "${v.product_id}" (${v.color_name} / ${v.size}) Stock: ${v.stock}`);
        });
      } else {
        console.log('  ⚠️ product_variants table is EMPTY in remote Supabase!');
      }
    }

    // 3. Query categories
    const { data: categoriesData, error: catErr, count: catCount } = await supabase
      .from('categories')
      .select('id, name, slug', { count: 'exact' });

    if (catErr) {
      console.error('\n[Database Error] Failed to fetch categories:', catErr);
    } else {
      console.log(`\n3. ACTUAL CATEGORIES IN SUPABASE: count=${catCount}, returnedRows=${categoriesData?.length}`);
      if (categoriesData && categoriesData.length > 0) {
        categoriesData.forEach((c) => {
          console.log(`  - [${c.id}] "${c.name}" (slug: ${c.slug})`);
        });
      }
    }

    // 4. Query orders
    const { data: ordersData, error: ordErr, count: ordCount } = await supabase
      .from('orders')
      .select('id, order_number, total, payment_status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordErr) {
      console.error('\n[Database Error] Failed to fetch orders:', ordErr);
    } else {
      console.log(`\n4. ACTUAL ORDERS IN SUPABASE: count=${ordCount}, returnedRows=${ordersData?.length}`);
      if (ordersData && ordersData.length > 0) {
        ordersData.forEach((o) => {
          console.log(`  - Order ${o.order_number} (${o.id}): ₹${o.total}, Payment: ${o.payment_status}, Created: ${o.created_at}`);
        });
      }
    }

    // 5. Test RPC presence
    console.log('\n5. CHECKOUT RPC TEST:');
    const { data: rpcData, error: rpcErr } = await supabase.rpc('create_customer_order', {
      payload: { test_presence_only: true }
    });
    if (rpcErr) {
      console.log('RPC Validation response:', rpcErr.message);
      if (rpcErr.message.includes('idempotency key is required')) {
        console.log('  ✅ create_customer_order RPC is INSTALLED and ENFORCING VALIDATION.');
      }
    } else {
      console.log('RPC Returned:', rpcData);
    }

  } catch (err) {
    console.error('Unexpected error during inspection:', err);
  }
}

inspectDatabase();
