with open('supabase/schema.sql', 'r', encoding='utf-8') as f:
    text = f.read()

import re
rls_policies = re.findall(r'CREATE POLICY[^\;]+\;', text, re.DOTALL)
print(f"Total RLS policies in schema.sql: {len(rls_policies)}")
for p in rls_policies:
    # print first 2 lines of policy
    lines = p.strip().splitlines()
    print("  *", lines[0])
    if len(lines) > 1:
        print("   ", lines[1].strip()[:80])

