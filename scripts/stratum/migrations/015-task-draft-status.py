"""
Migration 015 — Add DRAFT option to standard task.status SELECT enum.

Background:
  The stratum-sales-notes-app's "Extract Tasks" panel (v0.4.0+) creates AI-
  proposed tasks immediately at status=DRAFT, then promotes them to TODO when
  the user clicks Finalise. The DRAFT option doesn't exist in the upstream
  Twenty schema by default, so we add it here.

Adds DRAFT at position 0 (before TODO), color=gray. Bumps existing options'
positions accordingly so the new option groups first in kanban-by-status.

Idempotent: skips if DRAFT is already present in the options list.

Color name: confirmed `gray` (not `grey`) by reading
packages/twenty-ui/src/theme/constants/MainColorsLight.ts. Existing migration
002 (company subType) also uses `gray` for one of its options.
"""

import json

MIGRATION_ID = '015-task-draft-status'
DESCRIPTION = 'Add DRAFT option to standard task.status SELECT enum (position 0, gray)'

DRAFT_OPTION = {
    'id': '20202020-d4af-4d4a-9d40-7d1e4adef701',
    'color': 'gray',
    'label': 'Draft',
    'value': 'DRAFT',
    'position': 0,
}


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    task_obj = objects.get('task')
    if not task_obj or not task_obj.get('id'):
        print('  [error] task object not found (standard object — should always exist)')
        return

    task_object_id = task_obj['id']
    fields = client.get_object_fields(task_object_id)

    status_field = fields.get('status')
    if not status_field:
        print('  [error] task.status field not found')
        return

    options = status_field.get('options')
    # Twenty returns options as a list of dicts already; defend against the
    # JSON-string variant just in case the metadata API ever changes.
    if isinstance(options, str):
        options = json.loads(options)
    if options is None:
        options = []

    if any(o.get('value') == 'DRAFT' for o in options):
        print('  [skip]   DRAFT option already present on task.status')
        return

    print('  [update] inserting DRAFT at position 0 on task.status (existing options shift +1)')

    # Bump every existing option's position by 1 so DRAFT slots in at 0
    # without reusing a position. Twenty's UI sorts by position, so this
    # also reorders the kanban columns / dropdown listing.
    new_options = []
    new_options.append(dict(DRAFT_OPTION))
    for i, opt in enumerate(options, start=1):
        bumped = dict(opt)
        bumped['position'] = i
        new_options.append(bumped)

    if dry_run:
        for o in new_options:
            print(f'           pos={o["position"]:>2}  {o["value"]:<12}  {o["label"]:<12}  color={o["color"]}')
        return

    client.update_field(status_field['id'], options=new_options)

    # Re-read for sanity check.
    refreshed = client.get_object_fields(task_object_id)
    new = refreshed.get('status', {}).get('options') or []
    if isinstance(new, str):
        new = json.loads(new)
    has_draft = any(o.get('value') == 'DRAFT' for o in new)
    if has_draft:
        print(f'  [done]   task.status now has {len(new)} options (DRAFT @ pos 0)')
    else:
        print('  [warn]   update reported success but DRAFT not visible after re-read')
