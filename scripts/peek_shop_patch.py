with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect imports
idx = text.find('import {')
print(text[idx:idx+500])

