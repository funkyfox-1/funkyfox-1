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

async function inspectStructure() {
  console.log('--- RECONFIRMING REMOTE DATABASE STRUCTURE ---');

  // Check columns of customers
  const { data: custSample } = await supabase.from('customers').select('*').limit(1);
  console.log('Customers columns:', custSample ? Object.keys(custSample[0] || {}) : 'empty table');

  // Check columns of orders
  const { data: orderSample } = await supabase.from('orders').select('*').limit(1);
  console.log('Orders columns:', orderSample ? Object.keys(orderSample[0] || {}) : 'empty table');

  // Check columns of order_items
  const { data: itemSample } = await supabase.from('order_items').select('*').limit(1);
  console.log('Order_items columns:', itemSample ? Object.keys(itemSample[0] || {}) : 'empty table');

  // Check admin_users
  const { data: adminUsers } = await supabase.from('admin_users').select('*');
  console.log('Admin users count:', adminUsers?.length);
  adminUsers?.forEach(a => console.log('  Admin:', a.email, a.role, a.auth_user_id));

  // Check store_settings
  const { data: settings } = await supabase.from('store_settings').select('*');
  console.log('Store settings row count:', settings?.length);
}

inspectStructure();

