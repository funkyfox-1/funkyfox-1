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

async function scanAllProducts() {
  const { data: prods } = await supabase.from('products').select('id, name, total_stock');
  console.log(`Total products: ${prods?.length}`);
  
  // Also fetch all variants to compare sums
  const { data: page1 } = await supabase.from('product_variants').select('product_id, stock').range(0, 999);
  const { data: page2 } = await supabase.from('product_variants').select('product_id, stock').range(1000, 1999);
  const allVariants = [...(page1 || []), ...(page2 || [])];
  
  const variantSumByProd: Record<string, number> = {};
  allVariants.forEach(v => {
    variantSumByProd[v.product_id] = (variantSumByProd[v.product_id] || 0) + v.stock;
  });

  const mismatches: any[] = [];
  prods?.forEach(p => {
    const sum = variantSumByProd[p.id] || 0;
    if (p.total_stock !== sum) {
      mismatches.push({ id: p.id, name: p.name, total_stock: p.total_stock, variant_sum: sum });
    }
  });

  console.log(`Products where total_stock !== variant_sum: ${mismatches.length}`);
  mismatches.forEach(m => console.log('  Mismatch:', m));
}

scanAllProducts();

