with open('src/admin/services/storeService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update seedAdminProducts to produce deterministic variant IDs matching seed.sql
old_variants_loop = """    colors.forEach((col) => {
      sizes.forEach((sz) => {
        variants.push({
          id: `${p.id}-${col.name.toLowerCase().replace(/\\s+/g, '-')}-${sz.toLowerCase()}`,
          productId: p.id,
          size: sz,
          colorName: col.name,
          colorHex: col.value,
          sku: `FF-${p.id.substring(0, 4).toUpperCase()}-${col.name.substring(0, 2).toUpperCase()}-${sz}`,
          stock: Math.floor(Math.random() * 8) + 2,
          price: p.price,
          inStock: true,
        });
      });
    });"""

new_variants_loop = """    colors.forEach((col) => {
      const colSlug = col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'standard';
      sizes.forEach((sz) => {
        const szSlug = sz.toLowerCase();
        variants.push({
          id: `${p.id}-${colSlug}-${szSlug}`,
          productId: p.id,
          size: sz,
          colorName: col.name,
          colorHex: col.value,
          sku: `FF-${p.id.replace(/-/g, '').substring(0, 8).toUpperCase()}-${colSlug.substring(0, 3).toUpperCase()}-${sz}`,
          stock: p.isBestseller ? 12 : 8,
          price: p.price,
          inStock: true,
        });
      });
    });"""

if old_variants_loop in text:
    text = text.replace(old_variants_loop, new_variants_loop)
    print("Replaced seedAdminProducts variants loop successfully!")
else:
    print("WARNING: old_variants_loop not matched exactly, checking with regex...")
    import re
    # Fallback replace
    pat = re.compile(r'colors\.forEach\(\(col\)\s*=>\s*\{.*?Math\.floor\(Math\.random\(\)\s*\*\s*8\)\s*\+\s*2.*?\}\);\s*\}\);', re.DOTALL)
    text = pat.sub(new_variants_loop.strip(), text)
    print("Regex replacement executed.")

# 2. Update createCustomerOrder
old_order_check = """    if (!isSupabaseConfigured) {
      throw new Error('Supabase database is not configured. Customer checkout is currently disabled.');
    }"""

new_order_check = """    if (!isSupabaseConfigured) {
      // Local Demo Mode: Validate all items against local authoritative records
      for (const it of input.items) {
        const prod = this.getProductById(it.id);
        if (!prod || prod.status !== 'active') {
          throw new Error(`Product "${it.name}" (${it.id}) is not active for sale.`);
        }
        if (prod.variants && prod.variants.length > 0) {
          const normSize = it.size.toLowerCase().trim();
          const normColor = it.color.toLowerCase().trim();
          const variant = prod.variants.find(
            (v) => v.size.toLowerCase().trim() === normSize &&
                   (!normColor || v.colorName.toLowerCase().trim() === normColor)
          );
          if (!variant) {
            throw new Error(`Unavailable product combination: "${prod.name}" in size "${it.size}" and color "${it.color}" does not exist.`);
          }
          if (variant.stock < it.quantity) {
            throw new Error(`Insufficient stock for "${prod.name}" (${it.size} / ${it.color}): requested ${it.quantity}, available ${variant.stock}.`);
          }
        }
      }
    }"""

if old_order_check in text:
    text = text.replace(old_order_check, new_order_check)
    print("Replaced createCustomerOrder check successfully!")
else:
    print("WARNING: old_order_check not matched!")

# Also make sure cloudResult is only awaited if isSupabaseConfigured
old_cloud_call = """    // 1. Authoritative Cloud Persistence via PostgreSQL RPC (Atomic locking & validation)
    const cloudResult = await SupabaseDbService.createCustomerOrder({"""

new_cloud_call = """    // 1. Authoritative Cloud Persistence via PostgreSQL RPC (Atomic locking & validation)
    let cloudResult: any = null;
    if (isSupabaseConfigured) {
      cloudResult = await SupabaseDbService.createCustomerOrder({"""

if old_cloud_call in text:
    text = text.replace(old_cloud_call, new_cloud_call)
    # close the if block after tax
    old_cloud_end = """    if (cloudResult?.tax !== undefined) {
      newOrder.tax = cloudResult.tax;
    }"""
    new_cloud_end = """    if (cloudResult?.tax !== undefined) {
      newOrder.tax = cloudResult.tax;
    }
    } else {
      newOrder.notes = '[LOCAL DEMO] Verified order created in local development mode';
    }"""
    text = text.replace(old_cloud_end, new_cloud_end)
    print("Wrapped cloud call in if (isSupabaseConfigured) successfully!")
else:
    print("WARNING: old_cloud_call not matched!")

with open('src/admin/services/storeService.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated storeService.ts!")

