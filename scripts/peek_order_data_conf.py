with open('src/components/OrderConfirmationPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('orderData')
print(text[idx-50:idx+600])

