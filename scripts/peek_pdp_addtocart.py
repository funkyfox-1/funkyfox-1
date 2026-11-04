with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const handleAddToCart =')
print(text[idx:idx+800])

