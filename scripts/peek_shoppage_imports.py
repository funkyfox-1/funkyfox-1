with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('import {')
idx2 = text.find('from \'../data/products\'')
print(text[idx:idx2+40])

