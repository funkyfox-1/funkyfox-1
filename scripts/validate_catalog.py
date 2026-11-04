import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the structure of products in products.ts
# We can extract the products array by finding export const products = [ ... ];
start = text.find('export const products')
end = text.find('export const ALL_SIZES')
array_text = text[start:end]

# Let's check each product object
import json

# Parse by regex or JS parser
prod_blocks = re.split(r'\n\s*\{\s*\n\s*[\'"]?id[\'"]?:', array_text)
print(f"Total product chunks: {len(prod_blocks) - 1}")

missing_fields = []
issues = []
categories = set()
all_ids = []

for idx, block in enumerate(prod_blocks[1:], 1):
    id_match = re.search(r'^\s*[\'"]([^\'"]+)[\'"]', block)
    if not id_match:
        issues.append(f"Product #{idx}: Could not parse ID")
        continue
    pid = id_match.group(1)
    all_ids.append(pid)

    name_m = re.search(r'[\'"]?name[\'"]?:\s*[\'"]([^\'"]+)[\'"]', block)
    price_m = re.search(r'[\'"]?price[\'"]?:\s*(\d+)', block)
    cat_m = re.search(r'[\'"]?category[\'"]?:\s*[\'"]([^\'"]+)[\'"]', block)
    img_m = re.search(r'[\'"]?image[\'"]?:\s*[\'"]([^\'"]+)[\'"]', block)
    sizes_m = re.search(r'[\'"]?sizes[\'"]?:\s*\[([^\]]*)\]', block)
    colors_m = re.search(r'[\'"]?colors[\'"]?:\s*\[([^\]]*)\]', block)

    if not name_m: issues.append(f"{pid}: missing name")
    if not price_m: issues.append(f"{pid}: missing price")
    if not cat_m: issues.append(f"{pid}: missing category")
    else: categories.add(cat_m.group(1))
    if not img_m: issues.append(f"{pid}: missing image")
    if not sizes_m: issues.append(f"{pid}: missing sizes")

print("Issues found:", len(issues))
if issues:
    print("Sample issues:", issues[:10])
print(f"Total parsed IDs: {len(all_ids)}, Unique: {len(set(all_ids))}")
print("Found categories in array:", categories)

