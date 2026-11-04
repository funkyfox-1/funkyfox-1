with open('src/admin/lib/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export interface AdminOrder')
print(text[idx+1300:idx+2000])

