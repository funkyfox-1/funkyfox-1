with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'ALL_SIZES', text)]
print("ALL_SIZES positions:", matches)

prod_matches = [m.start() for m in re.finditer(r'export const products', text)]
print("export const products positions:", prod_matches)

# Let's inspect between line 150 and 200 in products.ts
lines = text.splitlines()
print(f"Total lines: {len(lines)}")
for idx in range(160, 220):
    if idx < len(lines):
        print(f"Line {idx+1}: {lines[idx]}")

