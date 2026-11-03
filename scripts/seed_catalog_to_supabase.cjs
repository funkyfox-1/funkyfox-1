const { createClient } = require('@supabase/supabase-js');
const { buildSync } = require('esbuild');

// 1. Load env
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseSecret = env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecret) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: { persistSession: false }
});

// 2. Load demo products from src/data/products.ts
const res = buildSync({
  entryPoints: ['src/data/products.ts'],
  bundle: true,
  format: 'cjs',
  write: false,
});
const m = { exports: {} };
new Function('module', 'exports', 'require', res.outputFiles[0].text)(m, m.exports, require);
const { products, categories } = m.exports;

async function runSeed() {
  console.log(`Starting catalog seed to Supabase (${supabaseUrl})...`);

  // 3. Categories
  const categoryImages = {
    'T-Shirts': '/images/category-tshirts.jpg',
    'Shirts': '/images/category-shirts.jpg',
    'Trousers & Jeans': '/images/category-trousers.jpg',
    'Jackets': '/images/category-jackets.jpg',
  };

  const categoryRecords = categories.map((cat, idx) => ({
    id: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: cat,
    slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: `Curated collection of Funky Fox ${cat.toLowerCase()} built for urban comfort.`,
    image: categoryImages[cat] || '/images/category-tshirts.jpg',
    is_visible: true,
    display_order: idx + 1,
  }));

  console.log(`Upserting ${categoryRecords.length} categories...`);
  const { error: catErr } = await supabase.from('categories').upsert(categoryRecords, { onConflict: 'id' });
  if (catErr) {
    console.error('Failed to upsert categories:', catErr);
    process.exit(1);
  }
  console.log('Categories upserted successfully.');

  // 4. Products & Variants
  const productRecords = [];
  const variantRecords = [];

  products.forEach((p, idx) => {
    const pSku = 'FF-' + String(idx + 1).padStart(4, '0') + '-' + p.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20);
    const catId = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null;

    const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'];
    const colors = p.colors && p.colors.length > 0 ? p.colors : [{ name: 'Standard', value: '#171717' }];

    let productStock = 0;
    colors.forEach((col, cIdx) => {
      sizes.forEach((sz) => {
        const vId = `${p.id}-${col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sz.toLowerCase()}`;
        const vSku = `${pSku}-C${cIdx + 1}-${sz}`;
        const stockQty = 15;
        productStock += stockQty;

        variantRecords.push({
          id: vId,
          product_id: p.id,
          size: sz,
          color_name: col.name,
          color_hex: col.value,
          sku: vSku,
          stock: stockQty,
          price: p.price,
          in_stock: true,
        });
      });
    });

    productRecords.push({
      id: p.id,
      slug: p.id,
      name: p.name,
      sku: pSku,
      short_description: p.description?.substring(0, 100) || `${p.name} crafted for effortless everyday style.`,
      description: p.description || `${p.name} — Premium quality materials, designed for durability and comfort.`,
      details: p.details || ['100% Breathable fabric', 'Durable tailored stitching', 'Machine wash cold'],
      price: p.price,
      original_price: p.originalPrice || Math.round(p.price * 1.3),
      cost_price: Math.round(p.price * 0.45),
      tax_rate: 18,
      category_id: catId,
      category: p.category,
      brand: 'Funky Fox',
      tags: ['everyday', p.category ? p.category.toLowerCase() : '', p.isNew ? 'new-arrival' : '', p.isBestseller ? 'bestseller' : ''].filter(Boolean),
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      alt: p.alt || `${p.name} product photo`,
      status: 'active',
      is_new: Boolean(p.isNew),
      is_bestseller: Boolean(p.isBestseller),
      featured_order: p.featuredOrder || idx + 1,
      total_stock: productStock,
      low_stock_threshold: 5,
      allow_backorders: false,
      seo_title: `${p.name} | Funky Fox Official`,
      seo_description: p.description || `${p.name} online from Funky Fox`,
    });
  });

  // Batch insert products (in chunks of 40)
  console.log(`Upserting ${productRecords.length} products in batches...`);
  const chunkSize = 40;
  for (let i = 0; i < productRecords.length; i += chunkSize) {
    const chunk = productRecords.slice(i, i + chunkSize);
    const { error: pErr } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (pErr) {
      console.error(`Error upserting products chunk ${i / chunkSize}:`, pErr);
      process.exit(1);
    }
    console.log(`  Upserted products ${i + 1} to ${Math.min(i + chunkSize, productRecords.length)}`);
  }

  // Batch insert variants (in chunks of 100)
  console.log(`Upserting ${variantRecords.length} variants in batches...`);
  const vChunkSize = 100;
  for (let i = 0; i < variantRecords.length; i += vChunkSize) {
    const chunk = variantRecords.slice(i, i + vChunkSize);
    const { error: vErr } = await supabase.from('product_variants').upsert(chunk, { onConflict: 'id' });
    if (vErr) {
      console.error(`Error upserting variants chunk ${i / vChunkSize}:`, vErr);
      process.exit(1);
    }
    console.log(`  Upserted variants ${i + 1} to ${Math.min(i + vChunkSize, variantRecords.length)}`);
  }

  // Ensure 'shirt' also has variants if none exist
  const { data: shirtVariants } = await supabase.from('product_variants').select('id').eq('product_id', 'shirt');
  if (!shirtVariants || shirtVariants.length === 0) {
    console.log('Adding default variants for existing product "shirt"...');
    const shirtSizes = ['S', 'M', 'L', 'XL'];
    const shirtVarRecords = shirtSizes.map((sz, idx) => ({
      id: `shirt-standard-${sz.toLowerCase()}`,
      product_id: 'shirt',
      size: sz,
      color_name: 'Standard',
      color_hex: '#171717',
      sku: `FF-SHIRT-STD-${sz}`,
      stock: 10,
      price: 999,
      in_stock: true,
    }));
    await supabase.from('product_variants').upsert(shirtVarRecords, { onConflict: 'id' });
  }

  // Final verification
  const { count: finalProdCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: finalVarCount } = await supabase.from('product_variants').select('*', { count: 'exact', head: true });
  console.log(`\n=== CATALOG SEED COMPLETE ===`);
  console.log(`Total Products in Supabase: ${finalProdCount}`);
  console.log(`Total Variants in Supabase: ${finalVarCount}`);
}

runSeed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
