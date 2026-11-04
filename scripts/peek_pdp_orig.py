with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('// Live Storefront Synchronization')
if idx != -1:
    print(text[idx-50:idx+400])
else:
    print("Not found, searching for function ProductDetailPage:")
    idx = text.find('export default function ProductDetailPage')
    print(text[idx:idx+600])

