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

async function scanAllVariants() {
  const intendedIds = JSON.parse(fs.readFileSync('scripts/intended_catalog_ids.json', 'utf-8'));
  
  // Page 1
  const { data: page1 } = await supabase.from('product_variants').select('id, product_id, stock').range(0, 999);
  // Page 2
  const { data: page2 } = await supabase.from('product_variants').select('id, product_id, stock').range(1000, 1999);
  
  const allVariants = [...(page1 || []), ...(page2 || [])];
  console.log(`Total variants fetched: ${allVariants.length}`);
  
  const non15 = allVariants.filter(v => v.stock !== 15);
  console.log(`Variants with stock !== 15: ${non15.length}`);
  non15.forEach(v => {
    console.log(`  - Variant: ${v.id} (Prod: ${v.product_id}), Stock: ${v.stock}`);
  });
}

scanAllVariants();

