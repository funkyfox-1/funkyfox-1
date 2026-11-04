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

async function inspectAuditAndAdmin() {
  const { data: adminUsers } = await supabase.from('admin_users').select('*');
  console.log('admin_users:', adminUsers);

  const { data: auditLogs } = await supabase.from('audit_logs').select('*');
  console.log('audit_logs:');
  auditLogs?.forEach(l => console.log(' ', l.action, l.entity_type, l.entity_id, l.details, l.created_at));
}

inspectAuditAndAdmin();

