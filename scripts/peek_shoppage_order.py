with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(120, 180):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')

