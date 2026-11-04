with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const product =')
print(text[idx-100:idx+400])

