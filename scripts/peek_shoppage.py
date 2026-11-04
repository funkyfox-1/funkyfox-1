with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const filteredProducts')
print(text[idx-100:idx+600])

