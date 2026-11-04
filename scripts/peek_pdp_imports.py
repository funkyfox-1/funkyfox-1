with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

for line in text.splitlines()[:35]:
    if 'import' in line:
        print(line)

