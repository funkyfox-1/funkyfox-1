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

async function testQuery() {
  const tables = [
    'customers',
    'orders',
    'order_items',
    'product_reviews',
    'reviews',
    'wishlists',
    'wishlist_items',
    'customer_addresses',
    'admin_users',
    'products',
    'product_variants',
    'inventory_logs',
    'coupons',
    'banners',
    'media_items',
    'audit_logs',
    'store_settings',
    'checkout_idempotency_records'
  ];

  console.log('--- Checking table existence via REST ---');
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`  Table '${t}': DOES NOT EXIST or error -> ${error.message} (code: ${error.code})`);
    } else {
      console.log(`  Table '${t}': EXISTS (sample rows accessible)`);
    }
  }
}

testQuery();

