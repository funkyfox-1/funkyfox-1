with open('src/data/kidsProducts.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
ids = re.findall(r'[\'"]?id[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', text)
print(f"Total kids products: {len(ids)}")
print("Sample IDs:", ids[:10])
cats = re.findall(r'[\'"]?category[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', text)
from collections import Counter
print("Categories in kidsProducts:", Counter(cats))

