with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const PAYMENT_METHODS')
print(text[idx:idx+1200])

