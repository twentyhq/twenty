"""
Migration 005 — Create Entity custom object.

Creates:
  - entity object
  - deal MANY_TO_ONE relation → deal  (creates deal.entities)

Depends on: 004-deal (deal object must exist first)

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '005-entity'
DESCRIPTION = 'Create Entity custom object with deal relation'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. entity object ──────────────────────────────────────────────────────
    if 'entity' in objects:
        print('  [skip] entity object already exists')
        entity_id = objects['entity']['id']
    else:
        print('  [create] entity object')
        if not dry_run:
            result = client.create_object(
                nameSingular='entity',
                namePlural='entities',
                labelSingular='Entity',
                labelPlural='Entities',
                description='A legal or corporate entity',
                icon='IconBuildingBank',
            )
            entity_id = result['id']
            print(f'    → id: {entity_id}')
            objects = client.get_all_objects()
        else:
            entity_id = '<dry-run>'

    # ── 2. deal MANY_TO_ONE → deal ────────────────────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(entity_id)
    else:
        fields = {}

    if 'deal' in fields:
        print('  [skip] deal relation already exists')
    else:
        deal_id = objects.get('deal', {}).get('id')
        if not deal_id:
            print('  [error] deal object not found — run 004-deal first')
        else:
            print('  [create] deal MANY_TO_ONE → deal (creates deal.entities)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=entity_id,
                    type='RELATION',
                    name='deal',
                    label='Deal',
                    isNullable=True,
                    icon='IconBriefcase',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': deal_id,
                        'targetFieldLabel': 'Entities',
                        'targetFieldIcon': 'IconBuildingBank',
                    },
                )
