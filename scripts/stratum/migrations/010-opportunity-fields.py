MIGRATION_ID = '010-opportunity-fields'
DESCRIPTION = 'Add industry SELECT and tags ARRAY fields to Opportunity'

FIELDS = [
    {
        'name': 'industry',
        'label': 'Industry',
        'type': 'SELECT',
        'settings': None,
        'options': [
            {'color': 'green', 'label': 'Food',   'value': 'FOOD',   'position': 0},
            {'color': 'jade',  'label': 'Tech',   'value': 'TECH',   'position': 1},
            {'color': 'mint',  'label': 'Travel', 'value': 'TRAVEL', 'position': 2},
        ],
    },
    {
        'name': 'tags',
        'label': 'Tags',
        'type': 'ARRAY',
        'settings': None,
    },
]


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    opportunity_id = objects.get('opportunity', {}).get('id')
    if not opportunity_id:
        print('  [error] opportunity object not found')
        return

    existing_fields = client.get_object_fields(opportunity_id)

    for field in FIELDS:
        name = field['name']
        if name in existing_fields:
            print(f'  [skip]   {name} already exists')
            continue

        print(f'  [create] {name}  ({field["type"]})')
        if not dry_run:
            kwargs = {
                'objectMetadataId': opportunity_id,
                'type': field['type'],
                'name': name,
                'label': field['label'],
                'isNullable': True,
            }
            if field.get('settings'):
                kwargs['settings'] = field['settings']
            if field.get('options'):
                kwargs['options'] = field['options']
            client.create_field(**kwargs)
