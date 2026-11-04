import re
import json

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse products
start_idx = text.find('export const products: Product[] = [')
end_idx = text.find('export const ALL_SIZES', start_idx)
code = text[start_idx:end_idx]

# Extract product blocks by brace depth
products = []
current_prod_chars = []
brace_depth = 0
in_array = False

for ch in code:
    if ch == '[' and not in_array:
        in_array = True
        continue
    if not in_array:
        continue
    if ch == '{':
        brace_depth += 1
        if brace_depth == 1:
            current_prod_chars = ['{']
        else:
            current_prod_chars.append('{')
    elif ch == '}':
        brace_depth -= 1
        current_prod_chars.append('}')
        if brace_depth == 0:
            products.append(''.join(current_prod_chars))
            current_prod_chars = []
    else:
        if brace_depth > 0:
            current_prod_chars.append(ch)

print(f"Extracted {len(products)} product blocks")

# Also parse kidsProducts
with open('src/data/kidsProducts.ts', 'r', encoding='utf-8') as f:
    kids_text = f.read()

kids_start = kids_text.find('export const kidsProducts: Product[] = [')
kids_end = kids_text.rfind(']')
kids_code = kids_text[kids_start:kids_end+1]

kids_chars = []
brace_depth = 0
in_array = False
for ch in kids_code:
    if ch == '[' and not in_array:
        in_array = True
        continue
    if not in_array:
        continue
    if ch == '{':
        brace_depth += 1
        if brace_depth == 1:
            kids_chars = ['{']
        else:
            kids_chars.append('{')
    elif ch == '}':
        brace_depth -= 1
        kids_chars.append('}')
        if brace_depth == 0:
            products.append(''.join(kids_chars))
            kids_chars = []
    else:
        if brace_depth > 0:
            kids_chars.append(ch)

print(f"Total product blocks including kids: {len(products)}")

def extract_field(pattern, block, default=''):
    m = re.search(pattern, block, re.DOTALL)
    return m.group(1).strip() if m else default

# Check extraction for all
clean_products = []
skus = set()
slugs = set()

for idx, pstr in enumerate(products):
    pid = extract_field(r'[\'"]?id[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr)
    if not pid: continue
    
    name = extract_field(r'[\'"]?name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr, pid.replace('-', ' ').title())
    price = int(extract_field(r'[\'"]?price[\'"]?\s*:\s*(\d+)', pstr, '999'))
    orig_price_str = extract_field(r'[\'"]?originalPrice[\'"]?\s*:\s*(\d+)', pstr, '')
    orig_price = int(orig_price_str) if orig_price_str else int(price * 1.35)
    
    category = extract_field(r'[\'"]?category[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr, 'T-Shirts')
    image = extract_field(r'[\'"]?image[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr, '/images/category-tshirts.jpg')
    alt = extract_field(r'[\'"]?alt[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr, name)
    desc = extract_field(r'[\'"]?description[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr, f"{name} designed with premium fabrics for modern everyday style.")
    
    # Details array
    details_match = re.search(r'[\'"]?details[\'"]?\s*:\s*\[([^\]]*)\]', pstr, re.DOTALL)
    if details_match:
        details = [s.strip().strip('\'"') for s in re.findall(r'[\'"]([^\'"]+)[\'"]', details_match.group(1))]
    else:
        details = ["100% Premium Cotton Blend", "Reinforced Stitching", "Machine Wash Cold"]
        
    # Images array
    images_match = re.search(r'[\'"]?images[\'"]?\s*:\s*\[([^\]]*)\]', pstr, re.DOTALL)
    if images_match:
        images = [s.strip().strip('\'"') for s in re.findall(r'[\'"]([^\'"]+)[\'"]', images_match.group(1))]
    else:
        images = [image]

    # Sizes array
    sizes_match = re.search(r'[\'"]?sizes[\'"]?\s*:\s*\[([^\]]*)\]', pstr, re.DOTALL)
    if sizes_match:
        sizes = [s.strip().strip('\'"') for s in re.findall(r'[\'"]([^\'"]+)[\'"]', sizes_match.group(1))]
    else:
        sizes = ["S", "M", "L", "XL"]

    # Colors array
    colors_block_match = re.search(r'[\'"]?colors[\'"]?\s*:\s*\[([^\]]*)\]', pstr, re.DOTALL)
    colors = []
    if colors_block_match:
        c_matches = re.findall(r'\{[^\}]*name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"][^\}]*value[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"][^\}]*\}', colors_block_match.group(1))
        for cname, cval in c_matches:
            colors.append({'name': cname, 'value': cval})
    if not colors:
        colors = [{'name': 'Obsidian Black', 'value': '#171717'}, {'name': 'Raw White', 'value': '#F5F5F5'}]

    slug = pid
    if slug in slugs:
        slug = f"{slug}-{idx}"
    slugs.add(slug)

    sku = f"FF-{pid.replace('-', '').upper()[:8]}-{idx:03d}"
    skus.add(sku)

    is_new = 'isNew: true' in pstr or '"isNew": true' in pstr
    is_bestseller = 'isBestseller: true' in pstr or '"isBestseller": true' in pstr
    featured_order = int(extract_field(r'featuredOrder[\'"]?\s*:\s*(\d+)', pstr, str(idx + 1)))

    clean_products.append({
        'id': pid,
        'slug': slug,
        'name': name,
        'sku': sku,
        'description': desc,
        'details': details,
        'price': price,
        'original_price': orig_price,
        'category': category,
        'image': image,
        'images': images,
        'alt': alt,
        'sizes': sizes,
        'colors': colors,
        'is_new': is_new,
        'is_bestseller': is_bestseller,
        'featured_order': featured_order,
    })

print(f"Successfully processed {len(clean_products)} clean products!")
print(f"Total unique SKUs: {len(skus)}, unique slugs: {len(slugs)}")

