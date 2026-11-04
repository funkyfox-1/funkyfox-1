with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(25, 55):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')

