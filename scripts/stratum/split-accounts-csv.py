"""
Split accounts.csv into two import-ready files:
  - account-groups.csv  : one row per PARENT (name stripped of " (Parent)" suffix)
  - companies.csv       : one row per LEGAL_ENTITY (no accountType or parentName columns)
"""

import csv
import os

SRC = os.path.join(os.path.dirname(__file__), '..', 'accounts.csv')
OUT_GROUPS = os.path.join(os.path.dirname(__file__), '..', 'account-groups.csv')
OUT_COMPANIES = os.path.join(os.path.dirname(__file__), '..', 'companies.csv')

PARENT_SUFFIX = ' (Parent)'

groups = []
companies = []

with open(SRC, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        account_type = row['Account Type'].strip()
        name = row['Name'].strip()

        if account_type == 'PARENT':
            clean_name = name.removesuffix(PARENT_SUFFIX)
            groups.append({'Name': clean_name, 'Website': ''})

        elif account_type == 'LEGAL_ENTITY':
            companies.append({
                'Name': name,
                'Legal Name': row['Legal Name'].strip(),
                'Source': row['Source'].strip(),
            })

with open(OUT_GROUPS, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['Name', 'Website'])
    writer.writeheader()
    writer.writerows(groups)

with open(OUT_COMPANIES, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['Name', 'Legal Name', 'Source'])
    writer.writeheader()
    writer.writerows(companies)

print(f'Account groups : {len(groups):>4}  → account-groups.csv')
print(f'Companies      : {len(companies):>4}  → companies.csv')
