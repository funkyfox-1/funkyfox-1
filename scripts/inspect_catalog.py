import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match top-level products:
# In products.ts: export const products: Product[] = [ { id: '...', ... } ]
# We can find all id: '...' that appear at indent level of product object
matches = re.findall(r'^\s+id:\s*[\'"]([^\'"]+)[\'"],', text, re.MULTILINE)
print(f"Total products matched in src/data/products.ts: {len(matches)}")
print("Sample first 10 IDs:", matches[:10])
print("Sample last 10 IDs:", matches[-10:])
print("Duplicate IDs:", len(matches) - len(set(matches)))

# Count categories
cat_matches = re.findall(r'category:\s*[\'"]([^\'"]+)[\'"]', text)
from collections import Counter
print("Categories distribution in products.ts:", Counter(cat_matches))

