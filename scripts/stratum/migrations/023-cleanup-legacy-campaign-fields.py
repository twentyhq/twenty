"""
Migration 023 — Delete legacy campaign fields that prod has but UAT lacks.

After the new Campaigns data model (migration 020) was built and tested on UAT,
production retained five legacy fields from an earlier design. Verified via
diff-environments.py against prod on 2026-05-12. Row counts confirmed empty on
prod before this migration was written:

  campaign.campaignOwner          MANY_TO_ONE → workspaceMember   [0 rows populated]
  campaign.revenueAchieved        CURRENCY                        [0 rows populated]
  campaign.revenueTarget          CURRENCY                        [0 rows populated]
  company.targettedByCampaign     MANY_TO_ONE → campaign           [0 of 726 rows populated]

The fifth EXTRA field — campaign.targetCompanies (ONE_TO_MANY) — is the
auto-generated reverse of company.targettedByCampaign. Per migration 019's
pattern, reverse-side fields disappear automatically when the column-owning
MANY_TO_ONE side is deleted. No explicit delete needed for the reverse.

These legacy fields have been superseded by the new design:

  campaign.campaignOwner      →  campaign.owner            (new)
  campaign.revenueAchieved    →  campaign.actualCost       (new)
  campaign.revenueTarget      →  campaign.targetRevenue    (new)
  campaign.targetCompanies    →  campaign.members + MORPH_RELATION → company

NO MORPH_RELATION variants are deleted here, so the 2026-05-09 incident pattern
(cascade-drop of every target* column on the morph host) does NOT apply.
All four deletions are plain RELATION or scalar fields — safe via the API.

Idempotent: skips fields that don't exist. UAT will be all-skips because none
of these fields exist on UAT.
"""

MIGRATION_ID = '023-cleanup-legacy-campaign-fields'
DESCRIPTION = 'Delete legacy campaign fields (campaignOwner, revenueAchieved, revenueTarget) and the targetCompanies relation on company (prod-only cleanup)'

DELETIONS = [
    ('campaign', 'campaignOwner'),       # MANY_TO_ONE → workspaceMember (column: campaignOwnerId)
    ('campaign', 'revenueAchieved'),     # CURRENCY (composite: amountMicros + currencyCode)
    ('campaign', 'revenueTarget'),       # CURRENCY (composite: amountMicros + currencyCode)
    ('company',  'targettedByCampaign'), # MANY_TO_ONE → campaign  (column: targettedByCampaignId);
                                         # reverse campaign.targetCompanies (ONE_TO_MANY) auto-deletes
]


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    for obj_name, fld_name in DELETIONS:
        obj = objects.get(obj_name)
        if not obj:
            print(f'  [skip]   {obj_name} object not found')
            continue
        fields = client.get_object_fields(obj['id'])
        f = fields.get(fld_name)
        if not f:
            print(f'  [skip]   {obj_name}.{fld_name} already absent')
            continue
        ftype = f.get('type')
        print(f'  [delete] {obj_name}.{fld_name} ({ftype})')
        if not dry_run:
            try:
                deleted = client.delete_field(f['id'])
                if not deleted:
                    print(f'  [warn]   {obj_name}.{fld_name} delete returned not-found')
            except RuntimeError as e:
                print(f'  [warn]   {obj_name}.{fld_name} delete failed: {e}')
