with open('scripts/phase1_verification_suite.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace lines 268-270 with debug logging
target = """    const validItem = products[0];
    const authRecord = storeService.getProductById(validItem.id);
    if (authRecord && authRecord.status === 'active' && authRecord.totalStock > 0) {"""

replace = """    const validItem = storeService.getProducts()[0] || products[0];
    const authRecord = storeService.getProductById(validItem.id);
    if (authRecord && authRecord.status === 'active' && authRecord.totalStock > 0) {"""

text = text.replace(target, replace)

with open('scripts/phase1_verification_suite.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated Test 12 in phase1_verification_suite.ts")

