import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('export const products: Product[] = [')
end_idx = text.find('export const ALL_SIZES', start_idx)

# Search within text[start_idx:end_idx]
code = text[start_idx:end_idx]

# Let's count depth of braces
products = []
current_prod_chars = []
brace_depth = 0
in_array = False

i = 0
n = len(code)
while i < n:
    ch = code[i]
    if ch == '[' and not in_array:
        in_array = True
        i += 1
        continue
    
    if not in_array:
        i += 1
        continue

    # Inside array
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
            # End of a product object
            prod_str = ''.join(current_prod_chars)
            products.append(prod_str)
            current_prod_chars = []
    else:
        if brace_depth > 0:
            current_prod_chars.append(ch)
    i += 1

print(f"Total product objects parsed: {len(products)}")

# Now analyze each product object
parsed_list = []
categories_count = {}
all_ids = []

for idx, pstr in enumerate(products):
    id_m = re.search(r'[\'"]?id[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr)
    name_m = re.search(r'[\'"]?name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr)
    price_m = re.search(r'[\'"]?price[\'"]?\s*:\s*(\d+)', pstr)
    cat_m = re.search(r'[\'"]?category[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr)
    img_m = re.search(r'[\'"]?image[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', pstr)
    
    pid = id_m.group(1) if id_m else f'unknown-{idx}'
    all_ids.append(pid)
    cat = cat_m.group(1) if cat_m else 'Unknown'
    categories_count[cat] = categories_count.get(cat, 0) + 1

    parsed_list.append({
        'id': pid,
        'name': name_m.group(1) if name_m else '',
        'price': int(price_m.group(1)) if price_m else 0,
        'category': cat,
        'image': img_m.group(1) if img_m else '',
    })

print(f"Unique product IDs: {len(set(all_ids))}")
print("Category distribution:", categories_count)
print("First 3 products:", [(p['id'], p['name'], p['category']) for p in parsed_list[:3]])
print("Last 3 products:", [(p['id'], p['name'], p['category']) for p in parsed_list[-3:]])

