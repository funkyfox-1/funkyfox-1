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

async function checkTargetProducts() {
  const targetProductIds = ['modern-bandhgala-kurta', 'sandstone-nehru-jacket', 'essential-cotton-t-shirt'];
  
  for (const pid of targetProductIds) {
    const { data: prod } = await supabase.from('products').select('id, name, total_stock').eq('id', pid).single();
    const { data: variants } = await supabase.from('product_variants').select('id, color_name, size, stock').eq('product_id', pid);
    
    const sumStock = variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
    console.log(`Product: ${prod?.name} (${prod?.id})`);
    console.log(`  Reported total_stock in products table: ${prod?.total_stock}`);
    console.log(`  Sum of variant stock: ${sumStock}`);
    console.log(`  Variant count: ${variants?.length}`);
    variants?.forEach(v => {
      if (v.stock !== 15) {
        console.log(`    Variant ${v.id} (${v.color_name} / ${v.size}): ${v.stock} (Deducted: ${15 - v.stock})`);
      }
    });
  }
}

checkTargetProducts();
