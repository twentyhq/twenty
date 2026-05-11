"""
Migration 022 — Field descriptions for Campaign + CampaignMember + Opportunity.

Twenty renders fieldMetadata.description as the hover tooltip on the field
label in the record detail view. Populating it gives users a built-in
"what does this field mean?" hint without any UI changes.

Sets descriptions on the non-obvious fields added by migrations 020 and 021
across Campaign, CampaignMember, and Opportunity. Auto-generated reverse
relations that already carry stock descriptions ("Campaigns tied to the X")
are left alone.

Idempotent: skips fields whose description already matches the target value.
"""

MIGRATION_ID = '022-campaign-field-descriptions'
DESCRIPTION = 'Populate hover-tooltip descriptions on Campaign / CampaignMember / Opportunity fields'


# (objectNameSingular, fieldName) → description
DESCRIPTIONS: dict[tuple[str, str], str] = {
    # ── campaign ─────────────────────────────────────────────────────────────
    ('campaign', 'description'):          'Free-text description of the campaign — what it is and why.',
    ('campaign', 'status'):               'Lifecycle state — Planned, Active, Completed or Abandoned.',
    ('campaign', 'typeCustom'):           'Channel/medium for this campaign — Email, Phone, Event, Webinar, Direct Mail, Paid Ads, Social, Referral, Partner or Other.',
    ('campaign', 'startDate'):            'When the campaign begins.',
    ('campaign', 'endDate'):              'When the campaign ends.',
    ('campaign', 'budgetedCost'):         'Planned marketing spend for this campaign.',
    ('campaign', 'actualCost'):           'Actual marketing spend incurred so far.',
    ('campaign', 'code'):                 'Short tag used by the load-campaign.py loader to find the campaign and as a UTM value, e.g. Q2-NEWSLETTER. Keep it concise and unique.',
    ('campaign', 'taskTitleTemplate'):    'Template the loader uses for spawned task titles. Placeholders: {{person.name}}, {{company.name}}, {{campaign.name}}, {{campaign.code}}.',
    ('campaign', 'taskDueDaysFromStart'): 'Tasks spawned by the loader get a due date = campaign.startDate + this many days. Leave empty to spawn tasks with no due date.',
    ('campaign', 'targetMeetings'):       'Goal — number of meetings this campaign aims to book.',
    ('campaign', 'targetOpportunities'):  'Goal — number of opportunities this campaign aims to source.',
    ('campaign', 'targetRevenue'):        'Goal — total sourced pipeline value this campaign aims to generate.',
    ('campaign', 'owner'):                'Campaign manager — responsible for designing and running the campaign overall.',
    ('campaign', 'defaultAssignee'):      'Fallback rep used by the loader when a CSV row has no specific assigneeEmail.',
    ('campaign', 'parentCampaign'):       'Parent campaign, for nesting — e.g. a multi-touch sequence with sub-drops.',

    # ── campaignMember ───────────────────────────────────────────────────────
    ('campaignMember', 'touchType'):              'How the prospect was contacted — Email, Call, Meeting, Mail, Event or Other.',
    ('campaignMember', 'responseStatus'):         'Outcome of the outreach — Targeted, Contacted, Engaged, Responded, Converted or Unsubscribed.',
    ('campaignMember', 'priority'):               'Triage priority for the rep — High, Medium or Low. Drives B2B call-list ordering.',
    ('campaignMember', 'dateAdded'):              'When this prospect was added to the campaign.',
    ('campaignMember', 'dateResponded'):          'When the prospect first responded (Engaged or beyond). Enables days-to-respond reporting.',
    ('campaignMember', 'assignee'):               'Rep responsible for making contact with this specific Person/Company. Distinct from the campaign-level owner.',
    ('campaignMember', 'convertedToOpportunity'): 'If this outreach converted into a deal, link to that Opportunity here.',
    ('campaignMember', 'notes'):                  'Free-text notes about this specific outreach row.',

    # ── opportunity ──────────────────────────────────────────────────────────
    ('opportunity', 'primaryCampaignSource'):     'Which campaign sourced this opportunity (primary attribution). For multi-touch attribution, also use CampaignMember.convertedToOpportunity.',
}


def _fetch_descriptions_for_object(client, object_id: str) -> dict[str, tuple[str, str]]:
    """Return {fieldName: (fieldId, description)} for the given object.
    MetaClient.get_object_fields doesn't include description; query it directly."""
    data = client.gql(
        'query GetDescriptions($id: UUID!) { object(id: $id) { fields(paging: { first: 200 }) { edges { node { id name description } } } } }',
        {'id': object_id},
    )
    return {
        e['node']['name']: (e['node']['id'], e['node'].get('description') or '')
        for e in data['object']['fields']['edges']
    }


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    by_object: dict[str, list[tuple[str, str]]] = {}
    for (obj_name, field_name), desc in DESCRIPTIONS.items():
        by_object.setdefault(obj_name, []).append((field_name, desc))

    for obj_name, items in by_object.items():
        obj = objects.get(obj_name)
        if not obj:
            print(f'  [error] {obj_name} object not found')
            continue
        existing = _fetch_descriptions_for_object(client, obj['id'])
        for field_name, desc in items:
            entry = existing.get(field_name)
            if not entry:
                print(f'  [error] {obj_name}.{field_name} field not found')
                continue
            field_id, current = entry
            if current == desc:
                print(f'  [skip]   {obj_name}.{field_name}')
                continue
            print(f'  [update] {obj_name}.{field_name}')
            if not dry_run:
                client.update_field(field_id, description=desc)
