"""
Migration 004 — Create Deal custom object.

Creates:
  - deal object
  - account MANY_TO_ONE relation → company  (creates company.associatedDeals)

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '004-deal'
DESCRIPTION = 'Create Deal custom object with account relation to company'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. deal object ────────────────────────────────────────────────────────
    if 'deal' in objects:
        print('  [skip] deal object already exists')
        deal_id = objects['deal']['id']
    else:
        print('  [create] deal object')
        if not dry_run:
            result = client.create_object(
                nameSingular='deal',
                namePlural='deals',
                labelSingular='Deal',
                labelPlural='Deals',
                description='A deal or transaction',
                icon='IconBriefcase',
            )
            deal_id = result['id']
            print(f'    → id: {deal_id}')
            objects = client.get_all_objects()
        else:
            deal_id = '<dry-run>'

    # ── 2. account MANY_TO_ONE → company ──────────────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(deal_id)
    else:
        fields = {}

    if 'account' in fields:
        print('  [skip] account relation already exists')
    else:
        company_id = objects.get('company', {}).get('id')
        if not company_id:
            print('  [error] company object not found')
        else:
            print('  [create] account MANY_TO_ONE → company (creates company.associatedDeals)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=deal_id,
                    type='RELATION',
                    name='account',
                    label='Account',
                    isNullable=True,
                    icon='IconBuilding',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': company_id,
                        'targetFieldLabel': 'Associated Deals',
                        'targetFieldIcon': 'IconBriefcase',
                    },
                )
