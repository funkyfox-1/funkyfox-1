with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="size-selector-area"')
if idx != -1:
    print(text[idx-50:idx+1200])
else:
    print("Not found by id, searching for size buttons:")
    idx = text.find('selectedSize ===')
    print(text[idx-100:idx+1000])

