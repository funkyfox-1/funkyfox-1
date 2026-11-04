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

async function checkManagement() {
  const projectRef = envVars.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  console.log('Project ref:', projectRef);

  // Try calling pg endpoint or rest
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
    headers: {
      Authorization: `Bearer ${envVars.SUPABASE_SECRET_KEY}`,
    },
  });
  console.log('Management API status with secret key:', res.status, res.statusText);
}

checkManagement();

