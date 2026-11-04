import re
import json

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all id matches with or without quotes
ids = re.findall(r'[\'"]?id[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', text)
print(f"Total product IDs matched: {len(ids)}")
print(f"Unique product IDs: {len(set(ids))}")

# Check duplicate IDs
seen = set()
dups = []
for i in ids:
    if i in seen:
        dups.append(i)
    seen.add(i)
if dups:
    print(f"Duplicate IDs ({len(dups)}):", dups[:10])

# Check categories
cats = re.findall(r'[\'"]?category[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', text)
from collections import Counter
print("Categories distribution:", Counter(cats))

