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

async function checkOrders() {
  const { data, count, error } = await supabase.from('orders').select('*', { count: 'exact' });
  console.log('Orders query with SECRET_KEY: count=', count, 'error=', error);
  if (data && data.length > 0) {
    console.log('Sample order:', data[0]);
  }
}

checkOrders();

