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

async function checkKnownFunctions() {
  const fns = [
    'create_customer_order',
    'is_admin',
    'is_super_admin',
    'validate_order_status_transition',
    'cancel_customer_order'
  ];

  for (const fn of fns) {
    const { data, error } = await supabase.rpc(fn, {});
    console.log(`Function '${fn}':`, error ? `${error.code}: ${error.message}` : 'FOUND');
  }
}

checkKnownFunctions();

