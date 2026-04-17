MIGRATION_ID = '009-person-contact-enrichment-fields'
DESCRIPTION = 'Add contact enrichment fields to Person: profileHeadline, profileSummary, jobDescription, linkedinUuid, emailSource'

FIELDS = [
    {
        'name': 'profileHeadline',
        'label': 'Profile Headline',
        'type': 'TEXT',
        'settings': {'displayedMaxRows': 0},
    },
    {
        'name': 'profileSummary',
        'label': 'Profile Summary',
        'type': 'TEXT',
        'settings': {'displayedMaxRows': 2},
    },
    {
        'name': 'jobDescription',
        'label': 'Job Description',
        'type': 'TEXT',
        'settings': {'displayedMaxRows': 0},
    },
    {
        'name': 'linkedinUuid',
        'label': 'LinkedIn UUID',
        'type': 'LINKS',
        'settings': {'maxNumberOfValues': 1},
    },
    {
        'name': 'emailSource',
        'label': 'Email source',
        'type': 'SELECT',
        'settings': None,
        'options': [
            {'color': 'green', 'label': 'Inferred',          'value': 'INFERRED',          'position': 0},
            {'color': 'jade',  'label': 'Personal contact',  'value': 'PERSONAL_CONTACT',  'position': 1},
        ],
    },
]


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    person_id = objects.get('person', {}).get('id')
    if not person_id:
        print('  [error] person object not found')
        return

    existing_fields = client.get_object_fields(person_id)

    for field in FIELDS:
        name = field['name']
        if name in existing_fields:
            print(f'  [skip]   {name} already exists')
            continue

        print(f'  [create] {name}  ({field["type"]})')
        if not dry_run:
            kwargs = {
                'objectMetadataId': person_id,
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
