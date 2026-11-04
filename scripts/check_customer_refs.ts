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

async function inspectForeignKeys() {
  const testCustomerIds = [
    'cust-55502f40dc',
    'cust-2763354b9b',
    'cust-d790f8dae1',
    'cust-5e5a97250b',
    'cust-9486ab4d6f',
    'cust-b0907ea4d5',
    'cust-4659a57f80',
    'cust-0c50dabf07',
    'cust-fc74899368'
  ];

  const { data: reviews } = await supabase.from('reviews').select('*').in('customer_id', testCustomerIds);
  console.log('Reviews referencing test customers:', reviews?.length || 0);

  const { data: orders } = await supabase.from('orders').select('id').in('customer_id', testCustomerIds);
  console.log('Orders referencing test customers:', orders?.length || 0);
}

inspectForeignKeys();

