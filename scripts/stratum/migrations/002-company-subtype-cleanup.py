"""
Migration 002 — Company: add subType field, remove legacy parentAccount/childAccount.

Creates:
  - subType SELECT field on company (29 options matching the import CSV values)

Removes (idempotent — skips if already absent):
  - parentAccount RELATION (legacy PARENT company system, replaced by AccountGroup)
  - childAccount RELATION (legacy PARENT company system, replaced by AccountGroup)

Idempotent: skips any step that already exists / is already absent.
"""

MIGRATION_ID = '002-company-subtype-cleanup'
DESCRIPTION = 'Add subType SELECT to company; remove legacy parentAccount/childAccount relations'

SUB_TYPE_OPTIONS = [
    {'label': 'Advisory',                  'value': 'ADVISORY',                 'color': 'green',     'position': 0},
    {'label': 'Asset Finance/Leasing',     'value': 'ASSET_FINANCE_LEASING',    'color': 'jade',      'position': 1},
    {'label': 'Asset Manager',             'value': 'ASSET_MANAGER',            'color': 'mint',      'position': 2},
    {'label': 'Auto Finance',              'value': 'AUTO_FINANCE',             'color': 'turquoise', 'position': 3},
    {'label': 'BNPL/Payments',             'value': 'BNPL_PAYMENTS',            'color': 'cyan',      'position': 4},
    {'label': 'Building Society',          'value': 'BUILDING_SOCIETY',         'color': 'sky',       'position': 5},
    {'label': 'Challenger/Digital Bank',   'value': 'CHALLENGER_DIGITAL_BANK',  'color': 'blue',      'position': 6},
    {'label': 'Consumer Lending',          'value': 'CONSUMER_LENDING',         'color': 'iris',      'position': 7},
    {'label': 'Corporate',                 'value': 'CORPORATE',                'color': 'violet',    'position': 8},
    {'label': 'Custody/Transaction Bank',  'value': 'CUSTODY_TRANSACTION_BANK', 'color': 'purple',    'position': 9},
    {'label': 'Education Finance',         'value': 'EDUCATION_FINANCE',        'color': 'plum',      'position': 10},
    {'label': 'Embedded Finance',          'value': 'EMBEDDED_FINANCE',         'color': 'pink',      'position': 11},
    {'label': 'Fintech',                   'value': 'FINTECH',                  'color': 'bronze',    'position': 12},
    {'label': 'Full-Service IB',           'value': 'FULL_SERVICE_IB',          'color': 'gold',      'position': 13},
    {'label': 'Fund Services',             'value': 'FUND_SERVICES',            'color': 'brown',     'position': 14},
    {'label': 'Infrastructure',            'value': 'INFRASTRUCTURE',           'color': 'gray',      'position': 15},
    {'label': 'Insurance',                 'value': 'INSURANCE',                'color': 'red',       'position': 16},
    {'label': 'Insurance AM',              'value': 'INSURANCE_AM',             'color': 'ruby',      'position': 17},
    {'label': 'Litigation Finance',        'value': 'LITIGATION_FINANCE',       'color': 'crimson',   'position': 18},
    {'label': 'Mortgage/Property Finance', 'value': 'MORTGAGE_PROPERTY_FINANCE','color': 'tomato',    'position': 19},
    {'label': 'Private Credit',            'value': 'PRIVATE_CREDIT',           'color': 'orange',    'position': 20},
    {'label': 'Private Equity',            'value': 'PRIVATE_EQUITY',           'color': 'amber',     'position': 21},
    {'label': 'Public/Development Bank',   'value': 'PUBLIC_DEVELOPMENT_BANK',  'color': 'yellow',    'position': 22},
    {'label': 'Servicer',                  'value': 'SERVICER',                 'color': 'lime',      'position': 23},
    {'label': 'SME/Working Capital',       'value': 'SME_WORKING_CAPITAL',      'color': 'grass',     'position': 24},
    {'label': 'Sovereign/Strategic',       'value': 'SOVEREIGN_STRATEGIC',      'color': 'green',     'position': 25},
    {'label': 'Specialist Bank',           'value': 'SPECIALIST_BANK',          'color': 'jade',      'position': 26},
    {'label': 'Trade/Invoice Finance',     'value': 'TRADE_INVOICE_FINANCE',    'color': 'mint',      'position': 27},
    {'label': 'Universal/Commercial Bank', 'value': 'UNIVERSAL_COMMERCIAL_BANK','color': 'turquoise', 'position': 28},
]


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    company_id = objects.get('company', {}).get('id')
    if not company_id:
        print('  [error] company object not found')
        return

    fields = client.get_object_fields(company_id)

    # ── 1. Add subType SELECT ─────────────────────────────────────────────────
    if 'subType' in fields:
        print('  [skip] subType field already exists')
    else:
        print('  [create] subType SELECT field on company')
        if not dry_run:
            client.create_field(
                objectMetadataId=company_id,
                type='SELECT',
                name='subType',
                label='Sub-type',
                isNullable=True,
                options=SUB_TYPE_OPTIONS,
            )

    # ── 2. Remove legacy parentAccount ───────────────────────────────────────
    if 'parentAccount' not in fields:
        print('  [skip] parentAccount already absent')
    else:
        print('  [delete] parentAccount relation (legacy PARENT system)')
        if not dry_run:
            client.delete_field(fields['parentAccount']['id'])

    # ── 3. Remove legacy childAccount ────────────────────────────────────────
    if 'childAccount' not in fields:
        print('  [skip] childAccount already absent')
    else:
        print('  [delete] childAccount relation (legacy PARENT system)')
        if not dry_run:
            deleted = client.delete_field(fields['childAccount']['id'])
            if not deleted:
                print('    → already gone (deleted with parentAccount)')
