with open('src/admin/lib/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export interface AdminOrder')
print(text[idx+700:idx+1500])

