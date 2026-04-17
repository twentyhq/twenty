"""
Migration 007 — Create CriticalObligation custom object.

Creates:
  - criticalObligation object
  - category SELECT field
  - criticalDate DATE_TIME field
  - documentReference TEXT field
  - obligation SELECT field (12 options)
  - thirdPartyObligation BOOLEAN field
  - associatedEntity MANY_TO_ONE → entity         (creates entity.obligations)
  - staffTeam MANY_TO_ONE → staffTeam             (creates staffTeam.criticalObligations)
  - primaryResponsiblePerson MANY_TO_ONE → workspaceMember
      (creates workspaceMember.primaryCriticalObligations)
  - secondaryResponsiblePerson MANY_TO_ONE → workspaceMember
      (creates workspaceMember.secondaryCriticalObligations)

Depends on: 003-staff-team, 005-entity

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '007-critical-obligation'
DESCRIPTION = 'Create CriticalObligation object with fields and relations'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. criticalObligation object ──────────────────────────────────────────
    if 'criticalObligation' in objects:
        print('  [skip] criticalObligation object already exists')
        co_id = objects['criticalObligation']['id']
    else:
        print('  [create] criticalObligation object')
        if not dry_run:
            result = client.create_object(
                nameSingular='criticalObligation',
                namePlural='criticalObligations',
                labelSingular='Critical Obligation',
                labelPlural='Critical Obligations',
                description='A tracked compliance or reporting obligation',
                icon='IconAlertCircle',
            )
            co_id = result['id']
            print(f'    → id: {co_id}')
            objects = client.get_all_objects()
        else:
            co_id = '<dry-run>'

    if not dry_run:
        fields = client.get_object_fields(co_id)
    else:
        fields = {}

    # ── 2. category SELECT ────────────────────────────────────────────────────
    if 'category' in fields:
        print('  [skip] category field already exists')
    else:
        print('  [create] category SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=co_id,
                type='SELECT',
                name='category',
                label='Category',
                isNullable=True,
                options=[
                    {'label': 'Transaction Services', 'value': 'TRANSACTION_SERVICES', 'color': 'green', 'position': 0},
                ],
            )

    # ── 3. criticalDate DATE_TIME ─────────────────────────────────────────────
    if 'criticalDate' in fields:
        print('  [skip] criticalDate field already exists')
    else:
        print('  [create] criticalDate DATE_TIME field')
        if not dry_run:
            client.create_field(
                objectMetadataId=co_id,
                type='DATE_TIME',
                name='criticalDate',
                label='Critical Date',
                isNullable=True,
                settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'y-m-d'},
            )

    # ── 4. documentReference TEXT ─────────────────────────────────────────────
    if 'documentReference' in fields:
        print('  [skip] documentReference field already exists')
    else:
        print('  [create] documentReference TEXT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=co_id,
                type='TEXT',
                name='documentReference',
                label='Document Reference',
                isNullable=True,
                settings={'displayedMaxRows': 2},
            )

    # ── 5. obligation SELECT ──────────────────────────────────────────────────
    if 'obligation' in fields:
        print('  [skip] obligation field already exists')
    else:
        print('  [create] obligation SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=co_id,
                type='SELECT',
                name='obligation',
                label='Obligation',
                isNullable=True,
                options=[
                    {'label': 'Compliance Certificate',              'value': 'COMPLIANCE_CERTIFICATE',               'color': 'green',     'position': 0},
                    {'label': 'Annual Financial Statement submission','value': 'ANNUAL_FINANCIAL_STATEMENT_SUBMISSION', 'color': 'jade',      'position': 1},
                    {'label': 'CT600 corporation tax return filing',  'value': 'CT600_CORPORATION_TAX_RETURN_FILING',  'color': 'mint',      'position': 2},
                    {'label': 'Corporation tax payment',              'value': 'CORPORATION_TAX_PAYMENT',              'color': 'turquoise', 'position': 3},
                    {'label': 'Quarterly Investor Reporting Pack',    'value': 'QUARTERLY_INVESTOR_REPORTING_PACK',    'color': 'cyan',      'position': 4},
                    {'label': 'Facility Agent/Trustee reporting deadline', 'value': 'FACILITY_AGENT_TRUSTEE_REPORTING_DEADLINE', 'color': 'sky', 'position': 5},
                    {'label': 'Record date for Noteholder Payments',  'value': 'RECORD_DATE_FOR_NOTEHOLDER_PAYMENTS',  'color': 'blue',      'position': 6},
                    {'label': 'Noteholder Interest Payment Date',     'value': 'NOTEHOLDER_INTEREST_PAYMENT_DATE',     'color': 'iris',      'position': 7},
                    {'label': 'Audit engagement',                     'value': 'AUDIT_ENGAGEMENT',                     'color': 'violet',    'position': 8},
                    {'label': 'KYC / AML refresh cycle',             'value': 'KYC_AML_REFRESH_CYCLE',               'color': 'purple',    'position': 9},
                    {'label': 'Board meeting',                        'value': 'BOARD_MEETING',                        'color': 'plum',      'position': 10},
                    {'label': 'FATCA/CRS annual filing',              'value': 'FATCA_CRS_ANNUAL_FILING',             'color': 'pink',      'position': 11},
                ],
            )

    # ── 6. thirdPartyObligation BOOLEAN ───────────────────────────────────────
    if 'thirdPartyObligation' in fields:
        print('  [skip] thirdPartyObligation field already exists')
    else:
        print('  [create] thirdPartyObligation BOOLEAN field')
        if not dry_run:
            client.create_field(
                objectMetadataId=co_id,
                type='BOOLEAN',
                name='thirdPartyObligation',
                label='Third Party Obligation',
                isNullable=True,
            )

    # ── 7. associatedEntity MANY_TO_ONE → entity ──────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(co_id)
    if 'associatedEntity' in fields:
        print('  [skip] associatedEntity relation already exists')
    else:
        entity_id = objects.get('entity', {}).get('id')
        if not entity_id:
            print('  [error] entity object not found — run 005-entity first')
        else:
            print('  [create] associatedEntity MANY_TO_ONE → entity (creates entity.obligations)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=co_id,
                    type='RELATION',
                    name='associatedEntity',
                    label='Associated Entity',
                    isNullable=True,
                    icon='IconBuildingBank',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': entity_id,
                        'targetFieldLabel': 'Obligations',
                        'targetFieldIcon': 'IconAlertCircle',
                    },
                )

    # ── 8. staffTeam MANY_TO_ONE → staffTeam ─────────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(co_id)
    if 'staffTeam' in fields:
        print('  [skip] staffTeam relation already exists')
    else:
        staff_team_id = objects.get('staffTeam', {}).get('id')
        if not staff_team_id:
            print('  [error] staffTeam object not found — run 003-staff-team first')
        else:
            print('  [create] staffTeam MANY_TO_ONE → staffTeam (creates staffTeam.criticalObligations)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=co_id,
                    type='RELATION',
                    name='staffTeam',
                    label='Staff Team',
                    isNullable=True,
                    icon='IconUsers',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': staff_team_id,
                        'targetFieldLabel': 'Critical Obligations',
                        'targetFieldIcon': 'IconAlertCircle',
                    },
                )

    # ── 9. primaryResponsiblePerson MANY_TO_ONE → workspaceMember ─────────────
    if not dry_run:
        fields = client.get_object_fields(co_id)
    if 'primaryResponsiblePerson' in fields:
        print('  [skip] primaryResponsiblePerson relation already exists')
    else:
        wm_id = objects.get('workspaceMember', {}).get('id')
        if not wm_id:
            print('  [error] workspaceMember object not found')
        else:
            print('  [create] primaryResponsiblePerson MANY_TO_ONE → workspaceMember')
            if not dry_run:
                client.create_field(
                    objectMetadataId=co_id,
                    type='RELATION',
                    name='primaryResponsiblePerson',
                    label='Primary Responsible Person',
                    isNullable=True,
                    icon='IconUser',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': wm_id,
                        'targetFieldLabel': 'Primary Critical Obligations',
                        'targetFieldIcon': 'IconAlertCircle',
                    },
                )

    # ── 10. secondaryResponsiblePerson MANY_TO_ONE → workspaceMember ──────────
    if not dry_run:
        fields = client.get_object_fields(co_id)
    if 'secondaryResponsiblePerson' in fields:
        print('  [skip] secondaryResponsiblePerson relation already exists')
    else:
        wm_id = objects.get('workspaceMember', {}).get('id')
        if not wm_id:
            print('  [error] workspaceMember object not found')
        else:
            print('  [create] secondaryResponsiblePerson MANY_TO_ONE → workspaceMember')
            if not dry_run:
                client.create_field(
                    objectMetadataId=co_id,
                    type='RELATION',
                    name='secondaryResponsiblePerson',
                    label='Secondary Responsible Person',
                    isNullable=True,
                    icon='IconUser',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': wm_id,
                        'targetFieldLabel': 'Secondary Critical Obligations',
                        'targetFieldIcon': 'IconAlertCircle',
                    },
                )
