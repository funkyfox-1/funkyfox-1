with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in products.ts: {len(lines)}")
for i in range(min(50, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')

