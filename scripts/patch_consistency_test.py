with open('scripts/test_admin_storefront_consistency.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('updateVariantStock', 'adjustVariantStock')

with open('scripts/test_admin_storefront_consistency.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated script with adjustVariantStock")

