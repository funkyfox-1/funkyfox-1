with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
prod_end = text.find('export const ALL_SIZES')
print("export const ALL_SIZES index:", prod_end)
print("Length of file:", len(text))

# Let's inspect around lines 100-300
lines = text.splitlines()
print(f"Total lines: {len(lines)}")
for idx in [50, 100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 6800]:
    if idx < len(lines):
        print(f"Line {idx}: {lines[idx][:100]}")

