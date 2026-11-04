import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all lines with id:
lines = text.splitlines()
id_lines = []
for i, l in enumerate(lines):
    m = re.search(r'^\s*[\'"]?id[\'"]?:\s*[\'"]([^\'"]+)[\'"]', l)
    if m:
        id_lines.append((i+1, m.group(1), lines[i-1] if i > 0 else ''))

print(f"Total id lines: {len(id_lines)}")
print("First 5 lines:")
for lnum, pid, prev in id_lines[:5]:
    print(f"  Line {lnum}: id='{pid}' | prev line: {repr(prev)}")

print("Lines 18-25:")
for lnum, pid, prev in id_lines[18:25]:
    print(f"  Line {lnum}: id='{pid}' | prev line: {repr(prev)}")

