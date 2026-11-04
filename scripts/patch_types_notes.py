with open('src/admin/lib/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = "  internalNotes?: string[];"
replace = "  internalNotes?: string[];\n  notes?: string;"
text = text.replace(target, replace, 1)

with open('src/admin/lib/types.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added notes?: string to AdminOrder in types.ts")

