"""
Migration 017 — Align field labels and SELECT option labels between UAT and prod.

Per "resolve discrepancies once and for all" review (2026-05-09):

3a — FIELD LABELS: prod adopts UAT's Stratum-customised labels.
  Each entry sets a single canonical label; idempotent — only writes when the
  current label differs.

3b — SELECT OPTION LABELS: UAT adopts prod's titlecase labels (values + colors
  unchanged).
  Touches only the option labels we know diverge: quote.status (5),
  lineItem.feeType (1), quoteTerm.termType (4).

Idempotent on every step: reads current state, only writes when different.
"""

MIGRATION_ID = '017-realign-labels-and-options'
DESCRIPTION = 'Align field labels (prod→UAT) and SELECT option labels (UAT→prod)'

# 3a — canonical field labels (UAT versions). Migration writes these on whichever
# env currently has a different label, so both envs converge.
FIELD_LABELS = [
    ('opportunity', 'amount',                                    'Total fee rollup'),
    ('opportunity', 'name',                                      'Transaction Name'),
    ('opportunity', 'company',                                   'Client Account'),
    ('opportunity', 'stage',                                     'Sales Stage'),
    ('opportunity', 'closeDate',                                 'Expected Close date'),
    ('lineItem',    'name',                                      'Description'),
    ('quoteTerm',   'name',                                      'Description'),
    ('company',     'accountOwner',                              'Relationship Owner'),
    ('company',     'subType',                                   'Sub-type'),
    ('criticalObligation', 'thirdPartyObligation',               'Third-party Obligation'),
    ('criticalObligation', 'primaryResponsiblePerson',           'Primary responsible person'),
    ('staffTeam',   'teamMemberships',                           'Team memberships'),
    ('workspaceMember', 'ownedAccountGroups',                    'Owned account groups'),
]

# 3b — canonical SELECT option labels (prod versions). Map of
# (object, field, value) → label.
OPTION_LABELS = {
    ('quote',     'status',     'ACCEPTED'):           'Accepted',
    ('quote',     'status',     'DRAFT'):              'Draft',
    ('quote',     'status',     'REJECTED'):           'Rejected',
    ('quote',     'status',     'SENT'):               'Sent',
    ('quote',     'status',     'SUPERSEDED'):         'Superseded',
    ('lineItem',  'feeType',    'TIME_AND_MATERIALS'): 'Time and Materials',
    ('quoteTerm', 'termType',   'AD_HOC_FEE'):         'Ad Hoc Fee',
    ('quoteTerm', 'termType',   'LIABILITY_CAP'):      'Liability Cap',
    ('quoteTerm', 'termType',   'OUT_OF_SCOPE'):       'Out of Scope',
    ('quoteTerm', 'termType',   'PAYMENT_TERMS'):      'Payment Terms',
}


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 3a — field labels ──────────────────────────────────────────────
    for obj_name, fld_name, target_label in FIELD_LABELS:
        obj = objects.get(obj_name)
        if not obj:
            print(f'  [skip] {obj_name} object not found')
            continue
        fields = client.get_object_fields(obj['id'])
        f = fields.get(fld_name)
        if not f:
            print(f'  [skip] {obj_name}.{fld_name} field not found')
            continue
        current = f.get('label')
        if current == target_label:
            print(f'  [skip]   {obj_name}.{fld_name} label already {current!r}')
            continue
        print(f'  [update] {obj_name}.{fld_name} label  {current!r} → {target_label!r}')
        if not dry_run:
            client.update_field(f['id'], label=target_label)

    # ── 3b — SELECT option labels ──────────────────────────────────────
    # Group by (obj, field) so we update each field once with the full options list.
    by_field = {}
    for (obj_name, fld_name, value), target_label in OPTION_LABELS.items():
        by_field.setdefault((obj_name, fld_name), {})[value] = target_label

    for (obj_name, fld_name), value_to_label in by_field.items():
        obj = objects.get(obj_name)
        if not obj:
            print(f'  [skip] {obj_name} object not found')
            continue
        fields = client.get_object_fields(obj['id'])
        f = fields.get(fld_name)
        if not f:
            print(f'  [skip] {obj_name}.{fld_name} field not found')
            continue
        options = f.get('options') or []
        # Detect which values need an update.
        changes = []
        new_options = []
        for opt in options:
            v = opt.get('value')
            target = value_to_label.get(v)
            if target is not None and opt.get('label') != target:
                bumped = dict(opt)
                bumped['label'] = target
                new_options.append(bumped)
                changes.append((v, opt.get('label'), target))
            else:
                new_options.append(dict(opt))
        if not changes:
            print(f'  [skip]   {obj_name}.{fld_name} options already canonical')
            continue
        print(f'  [update] {obj_name}.{fld_name} option labels:')
        for v, old, new in changes:
            print(f'             {v}: {old!r} → {new!r}')
        if not dry_run:
            client.update_field(f['id'], options=new_options)
