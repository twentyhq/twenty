"""
Migration 003 — Create StaffTeam custom object.

Creates:
  - staffTeam object

Relations FROM other objects into staffTeam (e.g. criticalObligation.staffTeam,
teamMembership.staffTeam) are created in later migrations from the child side.

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '003-staff-team'
DESCRIPTION = 'Create StaffTeam custom object'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. staffTeam object ───────────────────────────────────────────────────
    if 'staffTeam' in objects:
        print('  [skip] staffTeam object already exists')
    else:
        print('  [create] staffTeam object')
        if not dry_run:
            result = client.create_object(
                nameSingular='staffTeam',
                namePlural='staffTeams',
                labelSingular='Staff Team',
                labelPlural='Staff Teams',
                description='A team of staff members',
                icon='IconUsers',
            )
            print(f'    → id: {result["id"]}')
