with open('scripts/phase1_verification_suite.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'TEST 12' in l:
        for j in range(i, min(len(lines), i+25)):
            print(f'{j+1}: {lines[j]}', end='')
        break

