"""
Seed law firm company records into Twenty CRM.

Two operations:
  1. Update domain names for two companies that already exist with no domain:
       - A&O Shearman - London  → aoshearman.com
       - Latham & Watkins - London → lw.com

  2. Create ten law firms that are missing from the database:
       Mayer Brown, Paul Hastings, Dentons, Norton Rose Fulbright, Baker McKenzie,
       Sidley Austin, Weil Gotshal, Morgan Lewis, Herbert Smith Freehills,
       Kirkland & Ellis

Idempotent: skips companies that already exist with the correct domain.

Usage:
    # UAT
    TWENTY_API_KEY=<key> TWENTY_API_URL=https://twenty-uat-0a4c.up.railway.app/graphql \\
        python3 scripts/seed-law-firms.py [--dry-run]

    # Production
    TWENTY_API_KEY=<key> TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \\
        python3 scripts/seed-law-firms.py [--dry-run]

    # API keys are in ~/_Projects/stratum/.env as TWENTY_UAT_API_KEY and TWENTY_PROD_API_KEY
"""

import argparse
import json
import os
import urllib.request

API_URL = os.environ.get(
    'TWENTY_API_URL',
    'https://twenty-production-eea0.up.railway.app/graphql',
)
API_KEY = os.environ.get('TWENTY_API_KEY', '')


# ── Companies to update (already exist, just missing domain) ─────────────────

DOMAIN_UPDATES = [
    {'name': 'A&O Shearman - London',    'domain': 'aoshearman.com'},
    {'name': 'Latham & Watkins - London', 'domain': 'lw.com'},
]

# ── Companies to create if missing ───────────────────────────────────────────

NEW_COMPANIES = [
    {'name': 'Mayer Brown - London',          'domain': 'mayerbrown.com'},
    {'name': 'Paul Hastings - London',         'domain': 'paulhastings.com'},
    {'name': 'Dentons - London',               'domain': 'dentons.com'},
    {'name': 'Norton Rose Fulbright - London', 'domain': 'nortonrosefulbright.com'},
    {'name': 'Baker McKenzie - London',        'domain': 'bakermckenzie.com'},
    {'name': 'Sidley Austin - London',         'domain': 'sidley.com'},
    {'name': 'Weil Gotshal - London',          'domain': 'weil.com'},
    {'name': 'Morgan Lewis - London',          'domain': 'morganlewis.com'},
    {'name': 'Herbert Smith Freehills - London', 'domain': 'hsf.com'},
    {'name': 'Kirkland & Ellis - London',      'domain': 'kirkland.com'},
]


# ── Workspace API client ──────────────────────────────────────────────────────

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


def find_company_by_name(name: str) -> dict | None:
    """Return the company node (id, name, domainName) or None if not found."""
    data = gql(
        '''
        query FindCompany($filter: CompanyFilterInput!) {
          companies(first: 5, filter: $filter) {
            edges {
              node {
                id
                name
                domainName { primaryLinkUrl primaryLinkLabel }
              }
            }
          }
        }
        ''',
        {'filter': {'name': {'eq': name}}},
    )
    edges = data['companies']['edges']
    return edges[0]['node'] if edges else None


def update_company_domain(company_id: str, domain: str) -> None:
    gql(
        '''
        mutation UpdateCompany($id: UUID!, $data: CompanyUpdateInput!) {
          updateCompany(id: $id, data: $data) { id name }
        }
        ''',
        {
            'id': company_id,
            'data': {'domainName': {'primaryLinkUrl': domain, 'primaryLinkLabel': ''}},
        },
    )


def create_company(name: str, domain: str) -> str:
    data = gql(
        '''
        mutation CreateCompany($data: CompanyCreateInput!) {
          createCompany(data: $data) { id name }
        }
        ''',
        {
            'data': {
                'name': name,
                'domainName': {'primaryLinkUrl': domain, 'primaryLinkLabel': ''},
            }
        },
    )
    return data['createCompany']['id']


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    if not API_KEY:
        raise SystemExit('TWENTY_API_KEY is not set')

    dry = args.dry_run
    if dry:
        print('DRY RUN — no changes will be made\n')

    print(f'Target: {API_URL}\n')

    # ── 1. Update domains on existing companies ───────────────────────────────
    print('=== Domain updates ===')
    for entry in DOMAIN_UPDATES:
        name = entry['name']
        domain = entry['domain']
        company = find_company_by_name(name)
        if not company:
            print(f'  [error] "{name}" not found — skipping')
            continue
        existing_domain = (company.get('domainName') or {}).get('primaryLinkUrl', '').strip()
        if existing_domain == domain:
            print(f'  [skip]   "{name}" already has domain {domain}')
        else:
            print(f'  [update] "{name}": "{existing_domain or "(none)"}" → {domain}')
            if not dry:
                update_company_domain(company['id'], domain)

    # ── 2. Create missing companies ───────────────────────────────────────────
    print('\n=== New companies ===')
    for entry in NEW_COMPANIES:
        name = entry['name']
        domain = entry['domain']
        company = find_company_by_name(name)
        if company:
            existing_domain = (company.get('domainName') or {}).get('primaryLinkUrl', '').strip()
            if existing_domain:
                print(f'  [skip]   "{name}" already exists (domain: {existing_domain})')
            else:
                print(f'  [update] "{name}" exists but has no domain — setting {domain}')
                if not dry:
                    update_company_domain(company['id'], domain)
        else:
            print(f'  [create] "{name}" ({domain})')
            if not dry:
                new_id = create_company(name, domain)
                print(f'    → id: {new_id}')

    print('\nDone.')


if __name__ == '__main__':
    main()
