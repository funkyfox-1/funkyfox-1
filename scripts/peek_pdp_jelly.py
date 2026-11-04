with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('<JellyRadio')
print(text[idx-50:idx+400])

