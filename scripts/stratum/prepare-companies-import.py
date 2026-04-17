"""
Convert companies_with_type_subtype.csv into an import-ready CSV for Twenty.
- Maps human-readable Type labels → clientCategory VALUES
- Maps human-readable Sub-Type labels → subType VALUES
- Adds Source = INITIAL_MIGRATION for all rows
- Outputs column headers matching Twenty field labels
"""

import csv
import os

SRC = os.path.join(os.path.dirname(__file__), '..', 'companies_with_type_subtype.csv')
OUT = os.path.join(os.path.dirname(__file__), '..', 'companies-import.csv')

CLIENT_CATEGORY = {
    'Bank':                 'BANK',
    'Fund':                 'FUND',
    'Investment Bank':      'INVESTMENT_BANK',
    'Law Firm':             'LAW_FIRM',
    'Non-bank Originator':  'NON_BANK_ORIGINATOR',
    'Other':                'OTHER',
}

SUB_TYPE = {
    'Advisory':                  'ADVISORY',
    'Asset Finance/Leasing':     'ASSET_FINANCE_LEASING',
    'Asset Manager':             'ASSET_MANAGER',
    'Auto Finance':              'AUTO_FINANCE',
    'BNPL/Payments':             'BNPL_PAYMENTS',
    'Building Society':          'BUILDING_SOCIETY',
    'Challenger/Digital Bank':   'CHALLENGER_DIGITAL_BANK',
    'Consumer Lending':          'CONSUMER_LENDING',
    'Corporate':                 'CORPORATE',
    'Custody/Transaction Bank':  'CUSTODY_TRANSACTION_BANK',
    'Education Finance':         'EDUCATION_FINANCE',
    'Embedded Finance':          'EMBEDDED_FINANCE',
    'Fintech':                   'FINTECH',
    'Full-Service IB':           'FULL_SERVICE_IB',
    'Fund Services':             'FUND_SERVICES',
    'Infrastructure':            'INFRASTRUCTURE',
    'Insurance':                 'INSURANCE',
    'Insurance AM':              'INSURANCE_AM',
    'Litigation Finance':        'LITIGATION_FINANCE',
    'Mortgage/Property Finance': 'MORTGAGE_PROPERTY_FINANCE',
    'Private Credit':            'PRIVATE_CREDIT',
    'Private Equity':            'PRIVATE_EQUITY',
    'Public/Development Bank':   'PUBLIC_DEVELOPMENT_BANK',
    'Servicer':                  'SERVICER',
    'SME/Working Capital':       'SME_WORKING_CAPITAL',
    'Sovereign/Strategic':       'SOVEREIGN_STRATEGIC',
    'Specialist Bank':           'SPECIALIST_BANK',
    'Trade/Invoice Finance':     'TRADE_INVOICE_FINANCE',
    'Universal/Commercial Bank': 'UNIVERSAL_COMMERCIAL_BANK',
}

rows = []
unmapped_types = set()
unmapped_subtypes = set()

with open(SRC, encoding='latin-1', newline='') as f:
    for row in csv.DictReader(f):
        raw_type = row['Type'].strip()
        raw_subtype = row['Sub-Type'].strip()

        cat = CLIENT_CATEGORY.get(raw_type, '')
        sub = SUB_TYPE.get(raw_subtype, '') if raw_subtype else ''

        if raw_type and not cat:
            unmapped_types.add(raw_type)
        if raw_subtype and not sub:
            unmapped_subtypes.add(raw_subtype)

        rows.append({
            'Name':            row['Name'].strip(),
            'Legal Name':      row['Legal Name'].strip(),
            'Client Category': cat,
            'Sub-type':        sub,
            'Source':          'INITIAL_MIGRATION',
        })

with open(OUT, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['Name', 'Legal Name', 'Client Category', 'Sub-type', 'Source'])
    writer.writeheader()
    writer.writerows(rows)

print(f'Written {len(rows)} rows → companies-import.csv')
if unmapped_types:
    print(f'WARNING: unmapped Type values: {unmapped_types}')
if unmapped_subtypes:
    print(f'WARNING: unmapped Sub-Type values: {unmapped_subtypes}')
if not unmapped_types and not unmapped_subtypes:
    print('All values mapped cleanly.')
