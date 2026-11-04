import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('export const products: Product[] = [')
end_idx = text.find('export const ALL_SIZES', start_idx)
code = text[start_idx:end_idx]

# Check the end of code
print("Tail of products array code:")
print(code[-1500:])

