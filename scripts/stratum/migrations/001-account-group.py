"""
Migration 001 — Create AccountGroup object.

Creates:
  - AccountGroup custom object (name, createdBy, position, timestamps auto-added by Twenty)
  - typeCustom SELECT field (Fund / Bank / Non-bank Originator / Investment Bank / Law Firm / Other)
  - groupOwner MANY_TO_ONE relation → WorkspaceMember
  - groupedAccounts ONE_TO_MANY relation → Company (creates inAccountGroup on company side)

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '001-account-group'
DESCRIPTION = 'Create AccountGroup custom object with Type field, groupOwner and groupedAccounts relations'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. AccountGroup object ────────────────────────────────────────────────
    if 'accountGroup' in objects:
        print('  [skip] accountGroup object already exists')
        account_group_id = objects['accountGroup']['id']
    else:
        print('  [create] accountGroup object')
        if not dry_run:
            result = client.create_object(
                nameSingular='accountGroup',
                namePlural='accountGroups',
                labelSingular='Account Group',
                labelPlural='Account Groups',
                description='Logical group of companies',
                icon='IconListNumbers',
            )
            account_group_id = result['id']
            print(f'    → id: {account_group_id}')
            # Refresh objects so we have the new ID
            objects = client.get_all_objects()
        else:
            account_group_id = '<dry-run>'

    # ── 2. typeCustom SELECT field ────────────────────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(account_group_id)
    else:
        fields = {}

    if 'typeCustom' in fields:
        print('  [skip] typeCustom field already exists')
    else:
        print('  [create] typeCustom SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=account_group_id,
                type='SELECT',
                name='typeCustom',
                label='Type',
                isNullable=True,
                options=[
                    {'label': 'Fund',                'value': 'FUND',               'color': 'green',     'position': 0},
                    {'label': 'Bank',                'value': 'BANK',               'color': 'jade',      'position': 1},
                    {'label': 'Non-bank Originator', 'value': 'NON_BANK_ORIGINATOR','color': 'mint',      'position': 2},
                    {'label': 'Investment Bank',     'value': 'INVESTMENT_BANK',    'color': 'turquoise', 'position': 3},
                    {'label': 'Law Firm',            'value': 'LAW_FIRM',           'color': 'cyan',      'position': 4},
                    {'label': 'Other',               'value': 'OTHER',              'color': 'sky',       'position': 5},
                ],
            )

    # ── 3. groupOwner MANY_TO_ONE → WorkspaceMember ───────────────────────────
    if 'groupOwner' in fields:
        print('  [skip] groupOwner relation already exists')
    else:
        workspace_member_id = objects.get('workspaceMember', {}).get('id')
        if not workspace_member_id:
            print('  [error] workspaceMember object not found — cannot create groupOwner relation')
        else:
            print('  [create] groupOwner MANY_TO_ONE → workspaceMember')
            if not dry_run:
                client.create_field(
                    objectMetadataId=account_group_id,
                    type='RELATION',
                    name='groupOwner',
                    label='Group Owner',
                    isNullable=True,
                    icon='IconUser',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': workspace_member_id,
                        'targetFieldLabel': 'Owned Account Groups',
                        'targetFieldIcon': 'IconListNumbers',
                    },
                )

    # ── 4. groupedAccounts ONE_TO_MANY → Company ─────────────────────────────
    if 'groupedAccounts' in fields:
        print('  [skip] groupedAccounts relation already exists')
    else:
        company_id = objects.get('company', {}).get('id')
        if not company_id:
            print('  [error] company object not found — cannot create groupedAccounts relation')
        else:
            print('  [create] groupedAccounts ONE_TO_MANY → company (creates inAccountGroup on company)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=account_group_id,
                    type='RELATION',
                    name='groupedAccounts',
                    label='Grouped Accounts',
                    isNullable=True,
                    icon='IconBuilding',
                    relationCreationPayload={
                        'type': 'ONE_TO_MANY',
                        'targetObjectMetadataId': company_id,
                        'targetFieldLabel': 'In Account Group',
                        'targetFieldIcon': 'IconListNumbers',
                    },
                )
