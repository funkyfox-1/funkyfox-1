with open('src/admin/services/storeService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('async createCustomerOrder(')
print(text[idx:idx+2000])

