with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const filteredProducts')
print(text[idx:idx+1500])

