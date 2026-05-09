"""
Migration 016 — Add riskFormCompleted BOOLEAN to opportunity.

Background:
  Production has a custom opportunity.riskFormCompleted (BOOLEAN, label "Risk
  Form Completed") that was added directly via the UI. UAT lacks it. This
  migration backfills the field on UAT so both environments converge.

Idempotent: skips if the field already exists.
"""

MIGRATION_ID = '016-opportunity-risk-form-completed'
DESCRIPTION = 'Add riskFormCompleted BOOLEAN to opportunity (backfill UAT to match prod)'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    opp = objects.get('opportunity')
    if not opp:
        print('  [error] opportunity object not found')
        return

    fields = client.get_object_fields(opp['id'])
    if 'riskFormCompleted' in fields:
        print('  [skip] opportunity.riskFormCompleted already exists')
        return

    print('  [create] opportunity.riskFormCompleted BOOLEAN')
    if not dry_run:
        client.create_field(
            objectMetadataId=opp['id'],
            type='BOOLEAN',
            name='riskFormCompleted',
            label='Risk Form Completed',
            isNullable=True,
        )
