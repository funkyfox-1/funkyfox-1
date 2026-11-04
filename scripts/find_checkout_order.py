with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('createCustomerOrder')
print(text[idx-200:idx+1500])

