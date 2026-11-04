with open('src/admin/services/storeService.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(805, 840):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')

