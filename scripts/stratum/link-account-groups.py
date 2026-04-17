"""
Link Companies to AccountGroups in Twenty via GraphQL API.

Reads accounts.csv to get the company → parent-name mapping, then:
1. Fetches all AccountGroups from Twenty (name → id)
2. Fetches all Companies from Twenty (name → id)
3. For each company with a Parent Name, calls updateCompany to set inAccountGroup

Usage:
    TWENTY_API_KEY=<key> python3 link-account-groups.py [--api-url <url>]

    Or set TWENTY_API_URL in the environment. Defaults to UAT.
"""

import csv
import json
import os
import sys
import argparse
import time
import urllib.request

API_URL = os.environ.get(
    'TWENTY_API_URL',
    'https://twenty-uat-0a4c.up.railway.app/graphql',
)
API_KEY = os.environ.get('TWENTY_API_KEY', '')

ACCOUNTS_CSV = os.path.join(os.path.dirname(__file__), '..', 'accounts.csv')


def gql(query: str, variables: dict | None = None) -> dict:
    payload = json.dumps({'query': query, 'variables': variables or {}}).encode()
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}',
        },
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    if 'errors' in result:
        raise RuntimeError(f"GraphQL error: {result['errors']}")
    return result['data']


def fetch_all(object_name: str, fields: str, plural: str | None = None) -> list[dict]:
    """Fetch all records of an object, paginating through cursors."""
    plural = plural or f'{object_name}s'
    records = []
    after = None
    while True:
        after_arg = f', after: "{after}"' if after else ''
        query = f"""
        query {{
          {plural}(first: 500{after_arg}) {{
            edges {{ node {{ {fields} }} }}
            pageInfo {{ hasNextPage endCursor }}
          }}
        }}
        """
        data = gql(query)
        connection = data[plural]
        records.extend(edge['node'] for edge in connection['edges'])
        if not connection['pageInfo']['hasNextPage']:
            break
        after = connection['pageInfo']['endCursor']
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-url', help='Override API URL')
    parser.add_argument('--dry-run', action='store_true', help='Print updates without executing')
    args = parser.parse_args()

    global API_URL
    if args.api_url:
        API_URL = args.api_url

    if not API_KEY:
        print('ERROR: Set TWENTY_API_KEY environment variable')
        sys.exit(1)

    # Build company → parent-name mapping from accounts.csv
    company_to_parent: dict[str, str] = {}
    with open(ACCOUNTS_CSV, encoding='latin-1', newline='') as f:
        for row in csv.DictReader(f):
            name = row['Name'].strip()
            parent = row['Parent Name'].strip()
            account_type = row['Account Type'].strip()
            if account_type == 'LEGAL_ENTITY' and parent:
                company_to_parent[name] = parent.removesuffix(' (Parent)')

    print(f'Companies with a parent reference in CSV: {len(company_to_parent)}')

    # Fetch all AccountGroups
    print('Fetching AccountGroups...')
    groups = fetch_all('accountGroup', 'id name')
    group_by_name = {g['name']: g['id'] for g in groups}
    print(f'  Found {len(groups)} AccountGroups')

    # Fetch all Companies
    print('Fetching Companies...')
    companies = fetch_all('company', 'id name', plural='companies')
    company_by_name = {c['name']: c['id'] for c in companies}
    print(f'  Found {len(companies)} Companies')

    # Build update list
    updates = []
    missing_groups = []
    missing_companies = []

    for company_name, parent_name in company_to_parent.items():
        company_id = company_by_name.get(company_name)
        group_id = group_by_name.get(parent_name)

        if not company_id:
            missing_companies.append(company_name)
            continue
        if not group_id:
            missing_groups.append(f'{company_name} → {parent_name}')
            continue

        updates.append((company_id, company_name, group_id, parent_name))

    if missing_companies:
        print(f'\nWARNING: {len(missing_companies)} companies not found in Twenty:')
        for n in missing_companies:
            print(f'  - {n}')

    if missing_groups:
        print(f'\nWARNING: {len(missing_groups)} AccountGroups not found in Twenty:')
        for n in missing_groups:
            print(f'  - {n}')

    print(f'\nReady to link {len(updates)} companies to AccountGroups')

    if args.dry_run:
        print('\n[DRY RUN] Would update:')
        for company_id, company_name, group_id, parent_name in updates[:10]:
            print(f'  {company_name} → {parent_name}')
        if len(updates) > 10:
            print(f'  ... and {len(updates) - 10} more')
        return

    # Run updates
    mutation = """
    mutation LinkAccountGroup($id: UUID!, $groupId: ID!) {
      updateCompany(id: $id, data: { inAccountGroupId: $groupId }) {
        id
        name
      }
    }
    """

    ok = 0
    errors = 0
    for i, (company_id, company_name, group_id, parent_name) in enumerate(updates, 1):
        try:
            gql(mutation, {'id': company_id, 'groupId': group_id})
            ok += 1
            if i % 25 == 0 or i == len(updates):
                print(f'  {i}/{len(updates)} linked...')
        except Exception as e:
            print(f'  ERROR linking {company_name}: {e}')
            errors += 1
            continue
        time.sleep(0.7)  # stay under 100 tokens/60s rate limit

    print(f'\nDone. {ok} linked, {errors} errors.')


if __name__ == '__main__':
    main()
