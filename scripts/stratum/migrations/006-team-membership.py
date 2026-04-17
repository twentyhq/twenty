"""
Migration 006 — Create TeamMembership junction object.

Creates:
  - teamMembership object
  - staffTeam MANY_TO_ONE relation → staffTeam   (creates staffTeam.teamMemberships)
  - workspaceMember MANY_TO_ONE → workspaceMember (creates workspaceMember.teamMembership)

Depends on: 003-staff-team (staffTeam object must exist first)

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '006-team-membership'
DESCRIPTION = 'Create TeamMembership junction object linking StaffTeam and WorkspaceMember'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. teamMembership object ──────────────────────────────────────────────
    if 'teamMembership' in objects:
        print('  [skip] teamMembership object already exists')
        tm_id = objects['teamMembership']['id']
    else:
        print('  [create] teamMembership object')
        if not dry_run:
            result = client.create_object(
                nameSingular='teamMembership',
                namePlural='teamMemberships',
                labelSingular='Team Membership',
                labelPlural='Team Memberships',
                description='Links a workspace member to a staff team',
                icon='IconUsersGroup',
            )
            tm_id = result['id']
            print(f'    → id: {tm_id}')
            objects = client.get_all_objects()
        else:
            tm_id = '<dry-run>'

    # ── 2. staffTeam MANY_TO_ONE → staffTeam ─────────────────────────────────
    if not dry_run:
        fields = client.get_object_fields(tm_id)
    else:
        fields = {}

    if 'staffTeam' in fields:
        print('  [skip] staffTeam relation already exists')
    else:
        staff_team_id = objects.get('staffTeam', {}).get('id')
        if not staff_team_id:
            print('  [error] staffTeam object not found — run 003-staff-team first')
        else:
            print('  [create] staffTeam MANY_TO_ONE → staffTeam (creates staffTeam.teamMemberships)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=tm_id,
                    type='RELATION',
                    name='staffTeam',
                    label='Staff Team',
                    isNullable=True,
                    icon='IconUsers',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': staff_team_id,
                        'targetFieldLabel': 'Team Memberships',
                        'targetFieldIcon': 'IconUsersGroup',
                    },
                )

    # ── 3. workspaceMember MANY_TO_ONE → workspaceMember ─────────────────────
    if not dry_run:
        fields = client.get_object_fields(tm_id)  # refresh after possible creation above
    if 'workspaceMember' in fields:
        print('  [skip] workspaceMember relation already exists')
    else:
        wm_id = objects.get('workspaceMember', {}).get('id')
        if not wm_id:
            print('  [error] workspaceMember object not found')
        else:
            print('  [create] workspaceMember MANY_TO_ONE → workspaceMember (creates workspaceMember.teamMembership)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=tm_id,
                    type='RELATION',
                    name='workspaceMember',
                    label='Workspace Member',
                    isNullable=True,
                    icon='IconUser',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': wm_id,
                        'targetFieldLabel': 'Team Memberships',
                        'targetFieldIcon': 'IconUsersGroup',
                    },
                )
