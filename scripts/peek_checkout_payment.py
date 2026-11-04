with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('selectedPaymentMethod')
while idx != -1:
    print(text[max(0, idx-50):min(len(text), idx+200)])
    print('---')
    idx = text.find('selectedPaymentMethod', idx+1)

