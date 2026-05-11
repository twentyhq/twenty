"""
Migration 021 — Make campaign.members render as a junction-aware morph.

Adds `junctionTargetFieldId` to `campaign.members.settings` pointing at the
`campaignMember.targetPerson` morph variant. With this set, Twenty's
FieldWidgetJunctionRelationCard renders the underlying Person / Company
records (with their natural names) instead of CampaignMember.name chips.

Pointing at the targetPerson variant id is intentional and safe: Twenty's
metadata layer exposes both variants of a MORPH_RELATION through the same
`morphRelations` array on either variant row, so the consumer reads both
person and company variants regardless of which variant id we reference.

Same pattern as company.accountTags and person.personTags (junction-aware
ONE_TO_MANY reverses).

Idempotent: skips if junctionTargetFieldId already set correctly.
"""

MIGRATION_ID = '021-campaign-members-junction-aware'
DESCRIPTION = 'Mark campaign.members as a junction-aware ONE_TO_MANY so junction-card UI kicks in'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    campaign = objects.get('campaign')
    member = objects.get('campaignMember')
    if not campaign or not member:
        print('  [error] campaign or campaignMember object not found — run 020-campaigns first')
        return

    member_fields = client.get_object_fields(member['id'])
    target_person = member_fields.get('targetPerson')
    if not target_person:
        print('  [error] campaignMember.targetPerson morph variant not found — run 020-campaigns first')
        return
    junction_target_field_id = target_person['id']

    campaign_fields = client.get_object_fields(campaign['id'])
    members = campaign_fields.get('members')
    if not members:
        print('  [error] campaign.members reverse field not found — run 020-campaigns first')
        return

    current_settings = members.get('settings') or {}
    if current_settings.get('junctionTargetFieldId') == junction_target_field_id:
        print('  [skip]   campaign.members already has correct junctionTargetFieldId')
        return

    new_settings = {**current_settings, 'junctionTargetFieldId': junction_target_field_id}
    print(f'  [update] campaign.members settings.junctionTargetFieldId → {junction_target_field_id}')
    if not dry_run:
        client.update_field(members['id'], settings=new_settings)
