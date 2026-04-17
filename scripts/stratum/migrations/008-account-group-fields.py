"""
Migration 008 — Add missing fields to AccountGroup.

Adds:
  - source SELECT field (Initial Migration / LinkedIn / Referral / Direct / Conference / Other)
  - website LINKS field

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '008-account-group-fields'
DESCRIPTION = 'Add source SELECT and website LINKS fields to AccountGroup'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    ag_id = objects.get('accountGroup', {}).get('id')
    if not ag_id:
        print('  [error] accountGroup object not found — run 001-account-group first')
        return

    if not dry_run:
        fields = client.get_object_fields(ag_id)
    else:
        fields = {}

    # ── 1. source SELECT ──────────────────────────────────────────────────────
    if 'source' in fields:
        print('  [skip] source field already exists')
    else:
        print('  [create] source SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=ag_id,
                type='SELECT',
                name='source',
                label='Source',
                isNullable=True,
                options=[
                    {'label': 'Initial Migration', 'value': 'INITIAL_MIGRATION', 'color': 'green',     'position': 0},
                    {'label': 'LinkedIn',           'value': 'LINKEDIN',          'color': 'jade',      'position': 1},
                    {'label': 'Referral',           'value': 'REFERRAL',          'color': 'mint',      'position': 2},
                    {'label': 'Direct',             'value': 'DIRECT',            'color': 'turquoise', 'position': 3},
                    {'label': 'Conference',         'value': 'CONFERENCE',        'color': 'cyan',      'position': 4},
                    {'label': 'Other',              'value': 'OTHER',             'color': 'sky',       'position': 5},
                ],
            )

    # ── 2. website LINKS ──────────────────────────────────────────────────────
    if 'website' in fields:
        print('  [skip] website field already exists')
    else:
        print('  [create] website LINKS field')
        if not dry_run:
            client.create_field(
                objectMetadataId=ag_id,
                type='LINKS',
                name='website',
                label='Website',
                isNullable=True,
                settings={'maxNumberOfValues': 10},
            )
