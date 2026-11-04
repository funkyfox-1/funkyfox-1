import re
import json

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# We want to extract each product object from products.ts
# Let's find the start of the products array: export const products: Product[] = [
start_idx = text.find('export const products: Product[] = [')
end_idx = text.find('\nexport const ALL_SIZES', start_idx)

content = text[start_idx:end_idx]

# Pattern for products
# Each product has id, name, price, image, category, etc.
# Let's find all objects:
# Look for blocks starting with { and having id: "..." or "id": "..."
lines = content.splitlines()

products = []
current_prod = {}
in_prod = False
current_block = []

for l in lines:
    stripped = l.strip()
    if stripped == '{':
        in_prod = True
        current_block = [l]
    elif in_prod:
        current_block.append(l)
        if stripped == '},' or stripped == '}':
            block_str = '\n'.join(current_block)
            id_m = re.search(r'[\'"]?id[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', block_str)
            name_m = re.search(r'[\'"]?name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', block_str)
            price_m = re.search(r'[\'"]?price[\'"]?\s*:\s*(\d+)', block_str)
            cat_m = re.search(r'[\'"]?category[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', block_str)
            img_m = re.search(r'[\'"]?image[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', block_str)
            sizes_m = re.findall(r'[\'"]([SMLXL2]+)[\'"]', block_str)
            # Find colors: { name: "...", value: "..." }
            colors_raw = re.findall(r'name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"].*?value[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', block_str, re.DOTALL)
            
            if id_m:
                products.append({
                    'id': id_m.group(1),
                    'name': name_m.group(1) if name_m else 'Unknown',
                    'price': int(price_m.group(1)) if price_m else 0,
                    'category': cat_m.group(1) if cat_m else 'Unknown',
                    'image': img_m.group(1) if img_m else '',
                    'sizes': list(set(sizes_m)),
                    'colors': colors_raw,
                })
            in_prod = False

print(f"Parsed products count: {len(products)}")
categories_count = {}
for p in products:
    categories_count[p['category']] = categories_count.get(p['category'], 0) + 1

print("Categories count:", categories_count)
print("Sample first product:", products[0])
print("Sample last product:", products[-1])

