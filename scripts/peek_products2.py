import sys

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Find all occurrences of export const
exports = re.findall(r'export const (\w+)', text)
print("Exports in products.ts:", exports)

# Let's find all object definitions inside products array
# Look for { id: '...'
product_ids = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", text)
print(f"Total id matches: {len(product_ids)}")
print(product_ids[:20])

# Check where products array starts
start = text.find('export const products')
print("export const products index:", start)
if start != -1:
    snippet = text[start:start+1000]
    # safe print
    sys.stdout.buffer.write(snippet.encode('utf-8'))

