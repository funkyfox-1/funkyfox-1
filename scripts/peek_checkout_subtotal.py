with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const subtotal =')
print(text[idx-50:idx+400])

