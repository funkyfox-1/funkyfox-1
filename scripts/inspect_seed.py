with open('supabase/seed.sql', 'r', encoding='utf-8') as f:
    seed_text = f.read()

import re
seed_prod_ids = re.findall(r"INSERT INTO public\.products\s*\([^\)]+\)\s*VALUES\s*\(\s*['\"]([^'\"]+)['\"]", seed_text)
if not seed_prod_ids:
    # Try finding ('id', ...
    seed_prod_ids = re.findall(r"\(\s*['\"]([a-z0-9\-]+)['\"],\s*['\"][^'\"]+['\"],\s*\d+", seed_text)

print(f"Products in supabase/seed.sql: {len(seed_prod_ids)}")
print("Sample seed IDs:", seed_prod_ids[:10])

# Also check product_variants in seed.sql
variant_matches = re.findall(r"INSERT INTO public\.product_variants", seed_text)
print(f"product_variants insert statements in seed.sql: {len(variant_matches)}")
variant_rows = re.findall(r"\(\s*['\"]([a-z0-9\-]+-[a-z0-9\-]+)['\"]", seed_text)
print(f"Sample variant rows: {len(variant_rows)}")

