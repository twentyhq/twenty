"""
Migration 018 — Align field settings and add task.status REVIEW option.

Per "resolve discrepancies once and for all" review (2026-05-09):

3c — STRUCTURAL / SETTINGS:
  - opportunity.tags          → settings.maxNumberOfValues = 10  (prod adopts UAT's cap)
  - opportunity.closeDate     → settings.customUnicodeDateFormat = 'yyyy-MM-dd' (prod adopts UAT)
  task.status                 → add REVIEW option (yellow) — prod adopts UAT

Known-skipped (Twenty API doesn't support the change):
  - accounttag.searchVector / persontag.searchVector
    The asExpression on UAT is broken (`to_tsvector('simple', NULL)` —
    indexes nothing). Twenty's metadata API rejects updates to TS_VECTOR
    generated-column settings with INTERNAL_SERVER_ERROR (Migration execution
    failed). Resolution requires DDL on the workspace schema:
        ALTER TABLE <workspace>.accounttag DROP COLUMN "searchVector";
        ALTER TABLE <workspace>.accounttag ADD COLUMN "searchVector"
          tsvector GENERATED ALWAYS AS
          (to_tsvector('simple', COALESCE(public.unaccent_immutable("name"), '')))
          STORED;
    Then update the metadata.fieldMetadata.settings JSON manually. Track as
    a follow-up SQL migration; impact is low (search-by-name on accounttag
    and persontag rows doesn't work — junction objects, rarely user-searched).

Idempotent: each step reads current state and only writes when different.
"""

import json

MIGRATION_ID = '018-realign-settings-and-task-review'
DESCRIPTION = 'Align opportunity.tags/closeDate settings and add task.status REVIEW (searchVector fix is a separate SQL step)'

# Canonical settings overlays per (object, field). Only the listed keys are set;
# other keys in the existing settings dict are preserved.
SETTINGS_OVERLAYS = [
    ('opportunity', 'tags',         {'maxNumberOfValues': 10}),
    ('opportunity', 'closeDate',    {'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'}),
]

# task.status REVIEW option — yellow (matches the option spec already on UAT).
REVIEW_OPTION = {
    'id': '20202020-d4af-4d4a-9d40-7d1e4adef702',
    'color': 'yellow',
    'label': 'Review',
    'value': 'REVIEW',
    'position': 99,  # adjusted below to land at the end of current options
}


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 3c.1 — settings overlays ─────────────────────────────────────────
    for obj_name, fld_name, overlay in SETTINGS_OVERLAYS:
        obj = objects.get(obj_name)
        if not obj:
            print(f'  [skip] {obj_name} object not found')
            continue
        fields = client.get_object_fields(obj['id'])
        f = fields.get(fld_name)
        if not f:
            print(f'  [skip] {obj_name}.{fld_name} field not found')
            continue
        current = f.get('settings') or {}
        # Only the keys in overlay are checked — other keys preserved.
        diffs = {k: (current.get(k), v) for k, v in overlay.items() if current.get(k) != v}
        if not diffs:
            print(f'  [skip]   {obj_name}.{fld_name} settings already aligned')
            continue
        new_settings = dict(current)
        new_settings.update(overlay)
        print(f'  [update] {obj_name}.{fld_name} settings:')
        for k, (old, new) in diffs.items():
            old_s = (str(old)[:80] + '…') if old and len(str(old)) > 80 else str(old)
            new_s = (str(new)[:80] + '…') if new and len(str(new)) > 80 else str(new)
            print(f'             {k}: {old_s} → {new_s}')
        if not dry_run:
            try:
                client.update_field(f['id'], settings=new_settings)
            except RuntimeError as e:
                print(f'  [warn] {obj_name}.{fld_name} settings update rejected: {e}')

    # ── task.status REVIEW option ───────────────────────────────────────
    task_obj = objects.get('task')
    if not task_obj:
        print('  [error] task object not found (standard object — should always exist)')
        return
    fields = client.get_object_fields(task_obj['id'])
    status = fields.get('status')
    if not status:
        print('  [error] task.status field not found')
        return
    options = status.get('options') or []
    if isinstance(options, str):
        options = json.loads(options)
    if any(o.get('value') == 'REVIEW' for o in options):
        print('  [skip]   task.status REVIEW option already present')
        return
    next_pos = max((o.get('position', 0) for o in options), default=-1) + 1
    new_review = dict(REVIEW_OPTION)
    new_review['position'] = next_pos
    new_options = [dict(o) for o in options] + [new_review]
    print(f'  [update] task.status add REVIEW option (color=yellow, position={next_pos})')
    if not dry_run:
        client.update_field(status['id'], options=new_options)
