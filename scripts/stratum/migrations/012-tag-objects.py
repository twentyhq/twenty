"""
Migration 012 — Create Tag, AccountTag, and PersonTag objects.

Creates:
  - Tag custom object with colour SELECT, category SELECT, description TEXT
  - AccountTag junction object with account (MANY_TO_ONE → company) and tag (MANY_TO_ONE → tag) relations
  - PersonTag junction object with person (MANY_TO_ONE → person) and tag (MANY_TO_ONE → tag) relations

The back-relations (company.accounttags, person.persontags, tag.accounttags, tag.persontags)
and the standard morph-relations (attachment.targetTag, noteTarget.targetTag, etc.) are
created automatically by Twenty when the custom objects are created.

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '012-tag-objects'
DESCRIPTION = 'Create Tag custom object and AccountTag/PersonTag junction objects'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. Tag object ─────────────────────────────────────────────────────────
    if 'tag' in objects:
        print('  [skip] tag object already exists')
        tag_id = objects['tag']['id']
    else:
        print('  [create] tag object')
        if not dry_run:
            result = client.create_object(
                nameSingular='tag',
                namePlural='tags',
                labelSingular='Tag',
                labelPlural='Tags',
                description='Categorisation tags for people and companies',
                icon='IconTag',
            )
            tag_id = result['id']
            print(f'    → id: {tag_id}')
            objects = client.get_all_objects()
        else:
            tag_id = '<dry-run>'

    # ── 2. Tag fields ─────────────────────────────────────────────────────────
    if not dry_run:
        tag_fields = client.get_object_fields(tag_id)
    else:
        tag_fields = {}

    if 'colour' in tag_fields:
        print('  [skip] colour field already exists')
    else:
        print('  [create] colour SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=tag_id,
                type='SELECT',
                name='colour',
                label='Colour',
                isNullable=True,
                options=[
                    {'label': 'Red',    'value': 'RED',    'color': 'green',     'position': 0},
                    {'label': 'Orange', 'value': 'ORANGE', 'color': 'jade',      'position': 1},
                    {'label': 'Yellow', 'value': 'YELLOW', 'color': 'mint',      'position': 2},
                    {'label': 'Green',  'value': 'GREEN',  'color': 'turquoise', 'position': 3},
                    {'label': 'Blue',   'value': 'BLUE',   'color': 'cyan',      'position': 4},
                    {'label': 'Purple', 'value': 'PURPLE', 'color': 'sky',       'position': 5},
                    {'label': 'Pink',   'value': 'PINK',   'color': 'blue',      'position': 6},
                    {'label': 'Grey',   'value': 'GREY',   'color': 'iris',      'position': 7},
                ],
            )

    if 'category' in tag_fields:
        print('  [skip] category field already exists')
    else:
        print('  [create] category SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=tag_id,
                type='SELECT',
                name='category',
                label='Category',
                isNullable=True,
                options=[
                    {'label': 'Campaign Type', 'value': 'CAMPAIGN_TYPE', 'color': 'green',     'position': 0},
                    {'label': 'Industry',      'value': 'INDUSTRY',      'color': 'jade',      'position': 1},
                    {'label': 'Status',        'value': 'STATUS',        'color': 'mint',      'position': 2},
                    {'label': 'Priority',      'value': 'PRIORITY',      'color': 'turquoise', 'position': 3},
                ],
            )

    if 'description' in tag_fields:
        print('  [skip] description field already exists')
    else:
        print('  [create] description TEXT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=tag_id,
                type='TEXT',
                name='description',
                label='Description',
                isNullable=True,
            )

    # ── 3. AccountTag junction object ─────────────────────────────────────────
    if 'accounttag' in objects:
        print('  [skip] accounttag object already exists')
        accounttag_id = objects['accounttag']['id']
    else:
        print('  [create] accounttag object')
        if not dry_run:
            result = client.create_object(
                nameSingular='accounttag',
                namePlural='accounttags',
                labelSingular='AccountTag',
                labelPlural='AccountTags',
                description='Junction between Company and Tag',
                icon='IconTag',
            )
            accounttag_id = result['id']
            print(f'    → id: {accounttag_id}')
            objects = client.get_all_objects()
        else:
            accounttag_id = '<dry-run>'

    if not dry_run:
        accounttag_fields = client.get_object_fields(accounttag_id)
    else:
        accounttag_fields = {}

    if 'account' in accounttag_fields:
        print('  [skip] accounttag.account relation already exists')
    else:
        company_id = objects.get('company', {}).get('id')
        if not company_id:
            print('  [error] company object not found — cannot create accounttag.account relation')
        else:
            print('  [create] account MANY_TO_ONE → company (creates company.accounttags)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=accounttag_id,
                    type='RELATION',
                    name='account',
                    label='Account',
                    isNullable=True,
                    icon='IconBuilding',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': company_id,
                        'targetFieldLabel': 'Account Tags',
                        'targetFieldIcon': 'IconTag',
                    },
                )

    if 'tag' in accounttag_fields:
        print('  [skip] accounttag.tag relation already exists')
    else:
        current_tag_id = objects.get('tag', {}).get('id')
        if not current_tag_id:
            print('  [error] tag object not found — cannot create accounttag.tag relation')
        else:
            print('  [create] tag MANY_TO_ONE → tag (creates tag.accounttags)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=accounttag_id,
                    type='RELATION',
                    name='tag',
                    label='Tag',
                    isNullable=True,
                    icon='IconTag',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': current_tag_id,
                        'targetFieldLabel': 'Account Tags',
                        'targetFieldIcon': 'IconBuilding',
                    },
                )

    # ── 4. PersonTag junction object ──────────────────────────────────────────
    if 'persontag' in objects:
        print('  [skip] persontag object already exists')
        persontag_id = objects['persontag']['id']
    else:
        print('  [create] persontag object')
        if not dry_run:
            result = client.create_object(
                nameSingular='persontag',
                namePlural='persontags',
                labelSingular='PersonTag',
                labelPlural='PersonTags',
                description='Junction between Person and Tag',
                icon='IconTag',
            )
            persontag_id = result['id']
            print(f'    → id: {persontag_id}')
            objects = client.get_all_objects()
        else:
            persontag_id = '<dry-run>'

    if not dry_run:
        persontag_fields = client.get_object_fields(persontag_id)
    else:
        persontag_fields = {}

    if 'person' in persontag_fields:
        print('  [skip] persontag.person relation already exists')
    else:
        person_id = objects.get('person', {}).get('id')
        if not person_id:
            print('  [error] person object not found — cannot create persontag.person relation')
        else:
            print('  [create] person MANY_TO_ONE → person (creates person.persontags)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=persontag_id,
                    type='RELATION',
                    name='person',
                    label='Person',
                    isNullable=True,
                    icon='IconUser',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': person_id,
                        'targetFieldLabel': 'Person Tags',
                        'targetFieldIcon': 'IconTag',
                    },
                )

    if 'tag' in persontag_fields:
        print('  [skip] persontag.tag relation already exists')
    else:
        current_tag_id = objects.get('tag', {}).get('id')
        if not current_tag_id:
            print('  [error] tag object not found — cannot create persontag.tag relation')
        else:
            print('  [create] tag MANY_TO_ONE → tag (creates tag.persontags)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=persontag_id,
                    type='RELATION',
                    name='tag',
                    label='Tag',
                    isNullable=True,
                    icon='IconTag',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': current_tag_id,
                        'targetFieldLabel': 'Person Tags',
                        'targetFieldIcon': 'IconUser',
                    },
                )
