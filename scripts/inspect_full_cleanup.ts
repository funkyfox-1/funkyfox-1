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

async function run() {
  const { data: items, error: itemsErr } = await supabase.from('order_items').select('*');
  console.log('order_items count:', items?.length, 'error:', itemsErr);
  if (items && items.length > 0) {
    console.log('Sample item:', items[0]);
  }

  const { data: customers, error: custErr } = await supabase.from('customers').select('*');
  console.log('customers count:', customers?.length, 'error:', custErr);
  customers?.forEach(c => console.log('  Customer:', c.id, c.email, c.name));

  const { data: logs, error: logsErr } = await supabase.from('inventory_logs').select('*');
  console.log('inventory_logs count:', logs?.length, 'error:', logsErr);
  logs?.forEach(l => console.log('  Log:', l.id, l.variant_id, l.change, l.reason, l.previous_quantity, '->', l.new_quantity, l.created_at));
}

run();

