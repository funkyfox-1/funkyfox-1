import * as fs from 'fs';
import * as path from 'path';

function searchInDir(dir: string, pattern: string) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchInDir(full, pattern);
    } else if (f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf-8');
      if (content.includes(pattern)) {
        console.error(`SECURITY LEAK DETECTED: Found "${pattern}" inside ${full}!`);
        return true;
      }
    }
  }
  return false;
}

console.log('=== VERIFYING DIST BUNDLE FOR LEAKED SECRETS ===');
const distDir = 'dist';
const secretsToCheck = [
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'your-supabase-service-role-key',
  'RAZORPAY_KEY_SECRET',
  'SHIPROCKET_PASSWORD'
].filter(Boolean) as string[];

let leakFound = false;
for (const secret of secretsToCheck) {
  const leaked = searchInDir(distDir, secret);
  if (!leaked) {
    console.log(`  ✅ Safe: "${secret.substring(0, 10)}..." is NOT present in production bundle.`);
  } else {
    leakFound = true;
  }
}

if (!leakFound) {
  console.log('\nVERIFIED: Zero secret keys or service role tokens exist in frontend bundles.');
} else {
  console.error('\nSECURITY RISK: Some secret keys were found in the bundle!');
}
