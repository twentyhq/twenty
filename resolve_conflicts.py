#!/usr/bin/env python3
import re

# Read the file
with open('packages/twenty-server/src/engine/core-modules/i18n/locales/ja-JP.po', 'r') as f:
    content = f.read()

# Pattern to match conflicts where main has empty content
# <<<<<<< HEAD\n...content...\n=======\n>>>>>>> origin/main
pattern = r'<<<<<<< HEAD\n(.*?)=======\n>>>>>>> origin/main\n'

# Replace with just the HEAD content (the translations)
resolved = re.sub(pattern, r'\1', content, flags=re.DOTALL)

# Write back
with open('packages/twenty-server/src/engine/core-modules/i18n/locales/ja-JP.po', 'w') as f:
    f.write(resolved)

# Count remaining conflicts
remaining = resolved.count('<<<<<<< HEAD')
print(f"Resolved conflicts. Remaining: {remaining}")

