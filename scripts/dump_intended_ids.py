import json
from build_clean_catalog import clean_products
import re

prod_ids = [p['id'] for p in clean_products]

variant_ids = []
for p in clean_products:
    for col in p['colors']:
        col_slug = re.sub(r'[^a-z0-9]+', '-', col['name'].lower()).strip('-')
        for sz in p['sizes']:
            sz_slug = sz.lower()
            var_id = f"{p['id']}-{col_slug}-{sz_slug}"
            variant_ids.append(var_id)

data = {
    'product_count': len(prod_ids),
    'variant_count': len(variant_ids),
    'product_ids': prod_ids,
    'variant_ids': variant_ids,
}

with open('scripts/intended_catalog_ids.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Dumped {len(prod_ids)} intended product IDs and {len(variant_ids)} intended variant IDs.")

