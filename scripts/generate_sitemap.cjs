const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return match ? match[1].trim() : '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://gcvtitcegolmkhjqqpit.supabase.co';
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');

const BASE_URL = 'https://funkyfox.in';

async function generateSitemap() {
  console.log('[Sitemap] Connecting to Supabase to fetch active catalog products...');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, name, updated_at, image')
    .eq('status', 'active');

  if (error) {
    console.warn('[Sitemap] Could not fetch products from database, using static fallback:', error.message);
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/products`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/help`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.5' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Static routes
  for (const route of staticRoutes) {
    xml += `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  }

  // Product routes
  if (products && products.length > 0) {
    for (const prod of products) {
      const prodSlug = prod.slug || prod.id;
      const lastmod = prod.updated_at ? prod.updated_at.split('T')[0] : currentDate;
      const imageTag = prod.image
        ? `
    <image:image>
      <image:loc>${prod.image}</image:loc>
      <image:title><![CDATA[${prod.name || 'Funky Fox Menswear'}]]></image:title>
    </image:image>`
        : '';

      xml += `  <url>
    <loc>${BASE_URL}/products/${prodSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>
`;
    }
  }

  xml += `</urlset>\n`;

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`[Sitemap] Successfully wrote ${products ? products.length + staticRoutes.length : staticRoutes.length} URLs to ${outputPath}`);
}

generateSitemap().catch((err) => {
  console.error('[Sitemap] Generation failed:', err);
  process.exit(1);
});

