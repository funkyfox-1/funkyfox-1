with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const handleFinalOrderConfirm =')
print(text[idx:idx+900])

