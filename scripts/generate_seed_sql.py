import json
import re

# Load the clean products script
from build_clean_catalog import clean_products

def sql_escape(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def sql_array(arr):
    if not arr:
        return "'{}'::text[]"
    escaped_items = [item.replace("'", "''").replace('"', '\\"') for item in arr]
    return "ARRAY[" + ", ".join([f"'{item}'" for item in escaped_items]) + "]"

lines = []
lines.append("-- ====================================================================")
lines.append("-- FUNKY FOX ECOMMERCE PLATFORM — AUTHORITATIVE CATALOG SEED FIXTURES")
lines.append("-- ====================================================================")
lines.append("-- Populates all 158 Funky Fox products and variants across:")
lines.append("-- T-Shirts, Oversized Tees, Shirts, Trousers & Jeans, and Jackets.")
lines.append("-- Idempotent: Can be executed multiple times safely without duplicates.")
lines.append("-- ====================================================================\n")
lines.append("BEGIN;\n")

# 1. Categories
lines.append("-- --------------------------------------------------------------------")
lines.append("-- 1. CATEGORIES")
lines.append("-- --------------------------------------------------------------------")
lines.append("INSERT INTO public.categories (id, name, slug, description, image, is_visible, display_order)")
lines.append("VALUES")

cat_rows = [
    ("t-shirts", "T-Shirts", "t-shirts", "Heavyweight oversized streetwear tees, graphic prints and minimal luxury cottons.", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", True, 1),
    ("shirts", "Shirts", "shirts", "Tailored oxford shirts, linen shirts, festive kurtas and resort overshirts.", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", True, 2),
    ("trousers-jeans", "Trousers & Jeans", "trousers-jeans", "Pleated trousers, Japanese denim, utility cargo pants and relaxed chinos.", "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800", True, 3),
    ("jackets", "Jackets", "jackets", "Structured bomber jackets, canvas workwear, heavy hoodies and tailored blazers.", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", True, 4),
    ("cat_tees", "Graphic Tees", "graphic-tees", "Streetwear oversized tees", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", True, 5),
    ("cat_hoodies", "Hoodies & Fleece", "hoodies-fleece", "Premium cotton fleece hoodies", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800", True, 6),
    ("cat_bottoms", "Cargo & Pants", "cargo-pants", "Relaxed utility bottoms", "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800", True, 7),
]

cat_values = []
for cid, cname, cslug, cdesc, cimg, cvis, cord in cat_rows:
    cat_values.append(f"    ({sql_escape(cid)}, {sql_escape(cname)}, {sql_escape(cslug)}, {sql_escape(cdesc)}, {sql_escape(cimg)}, {'true' if cvis else 'false'}, {cord})")

lines.append(",\n".join(cat_values))
lines.append("ON CONFLICT (id) DO UPDATE SET")
lines.append("    name = EXCLUDED.name,")
lines.append("    slug = EXCLUDED.slug,")
lines.append("    description = EXCLUDED.description,")
lines.append("    image = EXCLUDED.image,")
lines.append("    is_visible = EXCLUDED.is_visible,")
lines.append("    display_order = EXCLUDED.display_order;\n")

# 2. Products
lines.append("-- --------------------------------------------------------------------")
lines.append("-- 2. AUTHORITATIVE PRODUCTS")
lines.append("-- --------------------------------------------------------------------")
lines.append("INSERT INTO public.products (")
lines.append("    id, slug, name, sku, short_description, description, details,")
lines.append("    price, original_price, cost_price, tax_rate, category_id, category,")
lines.append("    brand, tags, image, images, alt, status, is_new, is_bestseller,")
lines.append("    featured_order, total_stock, low_stock_threshold, allow_backorders")
lines.append(") VALUES")

prod_values = []
all_variants = []

cat_id_map = {
    'T-Shirts': 't-shirts',
    'Shirts': 'shirts',
    'Trousers & Jeans': 'trousers-jeans',
    'Jackets': 'jackets',
}

for p in clean_products:
    cid = cat_id_map.get(p['category'], 't-shirts')
    short_desc = p['description'][:100] + ('...' if len(p['description']) > 100 else '')
    
    # Calculate variants for this product
    prod_variants = []
    prod_total_stock = 0
    
    for col in p['colors']:
        col_slug = re.sub(r'[^a-z0-9]+', '-', col['name'].lower()).strip('-')
        for sz in p['sizes']:
            sz_slug = sz.lower()
            var_id = f"{p['id']}-{col_slug}-{sz_slug}"
            var_sku = f"{p['sku']}-{col_slug[:3].upper()}-{sz}"
            # Realistic stock: 5 to 20 units per variant
            stock_qty = 12 if p['is_bestseller'] else 8
            prod_total_stock += stock_qty
            
            prod_variants.append({
                'id': var_id,
                'product_id': p['id'],
                'size': sz,
                'color_name': col['name'],
                'color_hex': col['value'],
                'sku': var_sku,
                'stock': stock_qty,
                'price': p['price'],
                'in_stock': True
            })
            
    all_variants.extend(prod_variants)

    cost_price = int(p['price'] * 0.45)
    row = f"    ({sql_escape(p['id'])}, {sql_escape(p['slug'])}, {sql_escape(p['name'])}, {sql_escape(p['sku'])}, {sql_escape(short_desc)}, {sql_escape(p['description'])}, {sql_array(p['details'])}, {p['price']:.2f}, {p['original_price']:.2f}, {cost_price:.2f}, 18.00, {sql_escape(cid)}, {sql_escape(p['category'])}, 'Funky Fox', {sql_array([p['category'].lower(), 'streetwear', 'menswear'])}, {sql_escape(p['image'])}, {sql_array(p['images'])}, {sql_escape(p['alt'])}, 'active', {'true' if p['is_new'] else 'false'}, {'true' if p['is_bestseller'] else 'false'}, {p['featured_order']}, {prod_total_stock}, 5, false)"
    prod_values.append(row)

lines.append(",\n".join(prod_values))
lines.append("ON CONFLICT (id) DO UPDATE SET")
lines.append("    name = EXCLUDED.name,")
lines.append("    slug = EXCLUDED.slug,")
lines.append("    sku = EXCLUDED.sku,")
lines.append("    description = EXCLUDED.description,")
lines.append("    details = EXCLUDED.details,")
lines.append("    price = EXCLUDED.price,")
lines.append("    original_price = EXCLUDED.original_price,")
lines.append("    category_id = EXCLUDED.category_id,")
lines.append("    category = EXCLUDED.category,")
lines.append("    image = EXCLUDED.image,")
lines.append("    images = EXCLUDED.images,")
lines.append("    alt = EXCLUDED.alt,")
lines.append("    status = EXCLUDED.status,")
lines.append("    is_new = EXCLUDED.is_new,")
lines.append("    is_bestseller = EXCLUDED.is_bestseller,")
lines.append("    featured_order = EXCLUDED.featured_order,")
lines.append("    total_stock = EXCLUDED.total_stock;\n")

# 3. Product Variants
lines.append("-- --------------------------------------------------------------------")
lines.append(f"-- 3. PRODUCT VARIANTS ({len(all_variants)} total variants)")
lines.append("-- --------------------------------------------------------------------")
lines.append("INSERT INTO public.product_variants (")
lines.append("    id, product_id, size, color_name, color_hex, sku, stock, price, in_stock")
lines.append(") VALUES")

var_values = []
for v in all_variants:
    v_row = f"    ({sql_escape(v['id'])}, {sql_escape(v['product_id'])}, {sql_escape(v['size'])}, {sql_escape(v['color_name'])}, {sql_escape(v['color_hex'])}, {sql_escape(v['sku'])}, {v['stock']}, {v['price']:.2f}, {'true' if v['in_stock'] else 'false'})"
    var_values.append(v_row)

lines.append(",\n".join(var_values))
lines.append("ON CONFLICT (id) DO UPDATE SET")
lines.append("    stock = EXCLUDED.stock,")
lines.append("    price = EXCLUDED.price,")
lines.append("    in_stock = EXCLUDED.in_stock;\n")

lines.append("COMMIT;\n")

output_sql = "\n".join(lines)

with open('supabase/seed.sql', 'w', encoding='utf-8') as f:
    f.write(output_sql)

with open('supabase/migrations/20261104150000_authoritative_catalog_sync.sql', 'w', encoding='utf-8') as f:
    f.write(output_sql)

print(f"Generated seed.sql and migration successfully! Total variants: {len(all_variants)}, file size: {len(output_sql)} bytes")

