"""
Migration 020 — Create Campaign + CampaignMember objects.

Creates a marketing-campaign data model for B2B outreach:

  1. campaign object
       - name TEXT
       - description TEXT
       - status SELECT (Planned / Active / Completed / Abandoned)
       - type SELECT (Email / Phone / Event / Webinar / DirectMail / PaidAds / Social / Referral / Partner / Other)
       - startDate DATE_TIME
       - endDate DATE_TIME
       - budgetedCost CURRENCY
       - actualCost CURRENCY
       - code TEXT (short tag for UTM / loader key, e.g. Q2-NEWSLETTER)
       - taskTitleTemplate TEXT (used by load-campaign.py)
       - taskDueDaysFromStart NUMBER (used by load-campaign.py)
       - targetMeetings NUMBER (goal)
       - targetOpportunities NUMBER (goal)
       - targetRevenue CURRENCY (goal)
       - parentCampaign MANY_TO_ONE → campaign (self-relation, creates campaign.subCampaigns)
       - owner MANY_TO_ONE → workspaceMember (campaign manager)
       - defaultAssignee MANY_TO_ONE → workspaceMember (loader fallback)

  2. campaignMember object (junction)
       - touchType SELECT (Email / Call / Meeting / Mail / Event / Other)
       - responseStatus SELECT (Targeted / Contacted / Engaged / Responded / Converted / Unsubscribed)
       - priority SELECT (High / Medium / Low)
       - dateAdded DATE_TIME
       - dateResponded DATE_TIME
       - notes TEXT
       - campaign MANY_TO_ONE → campaign (creates campaign.members)
       - assignee MANY_TO_ONE → workspaceMember (rep responsible for this contact)
       - target MORPH_RELATION → [person, company]   (creates person.campaignMembers, company.campaignMembers)
       - convertedToOpportunity MANY_TO_ONE → opportunity (creates opportunity.sourcingCampaignMembers)

  3. opportunity.primaryCampaignSource MANY_TO_ONE → campaign
     (creates campaign.sourcedOpportunities reverse)

WARNING on MORPH_RELATION (per push-to-production skill, incident 2026-05-09):
  Do NOT delete a single variant of campaignMember.target via the metadata API.
  Doing so cascades and drops every target* column on campaignMember. If a
  variant needs removing, drop the specific column via SQL directly and then
  remove the fieldMetadata row, then cache-flush.

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '020-campaigns'
DESCRIPTION = 'Create Campaign + CampaignMember objects with relations and opportunity attribution'


def _fields(client, object_id, dry_run):
    return {} if dry_run else client.get_object_fields(object_id)


def _create_scalar(client, dry_run, *, object_id, name, type_, label, **kwargs):
    """Helper that creates a non-relation field with idempotency check."""
    fields = _fields(client, object_id, dry_run)
    if name in fields:
        print(f'  [skip]   {name} field already exists')
        return
    print(f'  [create] {name} {type_} field')
    if not dry_run:
        client.create_field(
            objectMetadataId=object_id,
            type=type_,
            name=name,
            label=label,
            isNullable=True,
            **kwargs,
        )


def _create_relation(client, dry_run, *, source_id, name, label, icon, rel_type, target_id, reverse_label, reverse_icon):
    """Helper that creates a MANY_TO_ONE or ONE_TO_MANY relation with idempotency check."""
    fields = _fields(client, source_id, dry_run)
    if name in fields:
        print(f'  [skip]   {name} relation already exists')
        return
    if not target_id:
        print(f'  [error] target object not found for {name} relation')
        return
    print(f'  [create] {name} {rel_type} → target (reverse: "{reverse_label}")')
    if not dry_run:
        client.create_field(
            objectMetadataId=source_id,
            type='RELATION',
            name=name,
            label=label,
            isNullable=True,
            icon=icon,
            relationCreationPayload={
                'type': rel_type,
                'targetObjectMetadataId': target_id,
                'targetFieldLabel': reverse_label,
                'targetFieldIcon': reverse_icon,
            },
        )


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. campaign object ────────────────────────────────────────────────────
    if 'campaign' in objects:
        print('  [skip]   campaign object already exists')
        campaign_id = objects['campaign']['id']
    else:
        print('  [create] campaign object')
        if not dry_run:
            result = client.create_object(
                nameSingular='campaign',
                namePlural='campaigns',
                labelSingular='Campaign',
                labelPlural='Campaigns',
                description='A marketing or outreach campaign — a named, time-bounded effort to engage a set of people or companies',
                icon='IconTargetArrow',
            )
            campaign_id = result['id']
            print(f'    → id: {campaign_id}')
            objects = client.get_all_objects()
        else:
            campaign_id = '<dry-run>'

    # Campaign scalar fields
    _create_scalar(client, dry_run, object_id=campaign_id, name='description', type_='TEXT',
                   label='Description', settings={'displayedMaxRows': 4})

    _create_scalar(client, dry_run, object_id=campaign_id, name='status', type_='SELECT',
                   label='Status',
                   options=[
                       {'label': 'Planned',   'value': 'PLANNED',   'color': 'sky',       'position': 0},
                       {'label': 'Active',    'value': 'ACTIVE',    'color': 'green',     'position': 1},
                       {'label': 'Completed', 'value': 'COMPLETED', 'color': 'turquoise', 'position': 2},
                       {'label': 'Abandoned', 'value': 'ABANDONED', 'color': 'red',       'position': 3},
                   ])

    _create_scalar(client, dry_run, object_id=campaign_id, name='typeCustom', type_='SELECT',
                   label='Type',
                   options=[
                       {'label': 'Email',        'value': 'EMAIL',        'color': 'green',     'position': 0},
                       {'label': 'Phone',        'value': 'PHONE',        'color': 'jade',      'position': 1},
                       {'label': 'Event',        'value': 'EVENT',        'color': 'mint',      'position': 2},
                       {'label': 'Webinar',      'value': 'WEBINAR',      'color': 'turquoise', 'position': 3},
                       {'label': 'Direct Mail',  'value': 'DIRECT_MAIL',  'color': 'cyan',      'position': 4},
                       {'label': 'Paid Ads',     'value': 'PAID_ADS',     'color': 'sky',       'position': 5},
                       {'label': 'Social',       'value': 'SOCIAL',       'color': 'blue',      'position': 6},
                       {'label': 'Referral',     'value': 'REFERRAL',     'color': 'purple',    'position': 7},
                       {'label': 'Partner',      'value': 'PARTNER',      'color': 'pink',      'position': 8},
                       {'label': 'Other',        'value': 'OTHER',        'color': 'gray',      'position': 9},
                   ])

    _create_scalar(client, dry_run, object_id=campaign_id, name='startDate', type_='DATE_TIME',
                   label='Start date',
                   settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'})

    _create_scalar(client, dry_run, object_id=campaign_id, name='endDate', type_='DATE_TIME',
                   label='End date',
                   settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'})

    _create_scalar(client, dry_run, object_id=campaign_id, name='budgetedCost', type_='CURRENCY',
                   label='Budgeted cost',
                   settings={'format': 'full', 'decimals': 0})

    _create_scalar(client, dry_run, object_id=campaign_id, name='actualCost', type_='CURRENCY',
                   label='Actual cost',
                   settings={'format': 'full', 'decimals': 0})

    _create_scalar(client, dry_run, object_id=campaign_id, name='code', type_='TEXT',
                   label='Code')

    _create_scalar(client, dry_run, object_id=campaign_id, name='taskTitleTemplate', type_='TEXT',
                   label='Task title template',
                   settings={'displayedMaxRows': 2})

    _create_scalar(client, dry_run, object_id=campaign_id, name='taskDueDaysFromStart', type_='NUMBER',
                   label='Task due days from start',
                   settings={'type': 'number', 'decimals': 0})

    _create_scalar(client, dry_run, object_id=campaign_id, name='targetMeetings', type_='NUMBER',
                   label='Target meetings',
                   settings={'type': 'number', 'decimals': 0})

    _create_scalar(client, dry_run, object_id=campaign_id, name='targetOpportunities', type_='NUMBER',
                   label='Target opportunities',
                   settings={'type': 'number', 'decimals': 0})

    _create_scalar(client, dry_run, object_id=campaign_id, name='targetRevenue', type_='CURRENCY',
                   label='Target revenue',
                   settings={'format': 'full', 'decimals': 0})

    # ── 2. campaignMember object ──────────────────────────────────────────────
    objects = client.get_all_objects() if not dry_run else objects

    if 'campaignMember' in objects:
        print('  [skip]   campaignMember object already exists')
        member_id = objects['campaignMember']['id']
    else:
        print('  [create] campaignMember object')
        if not dry_run:
            result = client.create_object(
                nameSingular='campaignMember',
                namePlural='campaignMembers',
                labelSingular='Campaign member',
                labelPlural='Campaign members',
                description='Membership of a Person or Company in a Campaign, with touch and response tracking',
                icon='IconUsers',
            )
            member_id = result['id']
            print(f'    → id: {member_id}')
            objects = client.get_all_objects()
        else:
            member_id = '<dry-run>'

    # CampaignMember scalar fields
    _create_scalar(client, dry_run, object_id=member_id, name='touchType', type_='SELECT',
                   label='Touch type',
                   options=[
                       {'label': 'Email',    'value': 'EMAIL',    'color': 'green',     'position': 0},
                       {'label': 'Call',     'value': 'CALL',     'color': 'jade',      'position': 1},
                       {'label': 'Meeting',  'value': 'MEETING',  'color': 'mint',      'position': 2},
                       {'label': 'Mail',     'value': 'MAIL',     'color': 'turquoise', 'position': 3},
                       {'label': 'Event',    'value': 'EVENT',    'color': 'cyan',      'position': 4},
                       {'label': 'Other',    'value': 'OTHER',    'color': 'gray',      'position': 5},
                   ])

    _create_scalar(client, dry_run, object_id=member_id, name='responseStatus', type_='SELECT',
                   label='Response status',
                   options=[
                       {'label': 'Targeted',     'value': 'TARGETED',     'color': 'sky',       'position': 0},
                       {'label': 'Contacted',    'value': 'CONTACTED',    'color': 'blue',      'position': 1},
                       {'label': 'Engaged',      'value': 'ENGAGED',      'color': 'turquoise', 'position': 2},
                       {'label': 'Responded',    'value': 'RESPONDED',    'color': 'mint',      'position': 3},
                       {'label': 'Converted',    'value': 'CONVERTED',    'color': 'green',     'position': 4},
                       {'label': 'Unsubscribed', 'value': 'UNSUBSCRIBED', 'color': 'red',       'position': 5},
                   ])

    _create_scalar(client, dry_run, object_id=member_id, name='priority', type_='SELECT',
                   label='Priority',
                   options=[
                       {'label': 'High',   'value': 'HIGH',   'color': 'red',  'position': 0},
                       {'label': 'Medium', 'value': 'MEDIUM', 'color': 'sky',  'position': 1},
                       {'label': 'Low',    'value': 'LOW',    'color': 'gray', 'position': 2},
                   ])

    _create_scalar(client, dry_run, object_id=member_id, name='dateAdded', type_='DATE_TIME',
                   label='Date added',
                   settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'})

    _create_scalar(client, dry_run, object_id=member_id, name='dateResponded', type_='DATE_TIME',
                   label='Date responded',
                   settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'})

    _create_scalar(client, dry_run, object_id=member_id, name='notes', type_='TEXT',
                   label='Notes',
                   settings={'displayedMaxRows': 4})

    # ── 3. Campaign self-relation: parentCampaign / subCampaigns ──────────────
    objects = client.get_all_objects() if not dry_run else objects
    campaign_id_resolved = objects.get('campaign', {}).get('id', campaign_id)

    _create_relation(client, dry_run,
                     source_id=campaign_id_resolved, name='parentCampaign',
                     label='Parent campaign', icon='IconTargetArrow', rel_type='MANY_TO_ONE',
                     target_id=campaign_id_resolved,
                     reverse_label='Sub-campaigns', reverse_icon='IconTargetArrow')

    # ── 4. Campaign → WorkspaceMember relations ───────────────────────────────
    workspace_member_id = objects.get('workspaceMember', {}).get('id')

    _create_relation(client, dry_run,
                     source_id=campaign_id_resolved, name='owner',
                     label='Owner', icon='IconUser', rel_type='MANY_TO_ONE',
                     target_id=workspace_member_id,
                     reverse_label='Owned campaigns', reverse_icon='IconTargetArrow')

    _create_relation(client, dry_run,
                     source_id=campaign_id_resolved, name='defaultAssignee',
                     label='Default assignee', icon='IconUserPlus', rel_type='MANY_TO_ONE',
                     target_id=workspace_member_id,
                     reverse_label='Default-assigned campaigns', reverse_icon='IconTargetArrow')

    # ── 5. CampaignMember → Campaign relation (creates campaign.members) ──────
    objects = client.get_all_objects() if not dry_run else objects
    member_id_resolved = objects.get('campaignMember', {}).get('id', member_id)

    _create_relation(client, dry_run,
                     source_id=member_id_resolved, name='campaign',
                     label='Campaign', icon='IconTargetArrow', rel_type='MANY_TO_ONE',
                     target_id=campaign_id_resolved,
                     reverse_label='Members', reverse_icon='IconUsers')

    # ── 6. CampaignMember → WorkspaceMember (assignee) ────────────────────────
    _create_relation(client, dry_run,
                     source_id=member_id_resolved, name='assignee',
                     label='Assignee', icon='IconUser', rel_type='MANY_TO_ONE',
                     target_id=workspace_member_id,
                     reverse_label='Assigned campaign members', reverse_icon='IconUsers')

    # ── 7. CampaignMember.target MORPH_RELATION → [person, company] ───────────
    person_id  = objects.get('person',  {}).get('id')
    company_id = objects.get('company', {}).get('id')

    fields = _fields(client, member_id_resolved, dry_run)
    # MORPH_RELATION exposes one field per variant — check for either to detect existence
    if 'targetPerson' in fields or 'targetCompany' in fields:
        print('  [skip]   target morph relation already exists')
    elif not person_id or not company_id:
        print('  [error] person or company object not found — cannot create target morph')
    else:
        print('  [create] target MORPH_RELATION → [person, company]')
        if not dry_run:
            client.create_field(
                objectMetadataId=member_id_resolved,
                type='MORPH_RELATION',
                name='target',
                label='Target',
                isNullable=True,
                icon='IconLink',
                morphRelationsCreationPayload=[
                    {
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': person_id,
                        'targetFieldLabel': 'Campaign Members',
                        'targetFieldIcon': 'IconUsers',
                    },
                    {
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': company_id,
                        'targetFieldLabel': 'Campaign Members',
                        'targetFieldIcon': 'IconUsers',
                    },
                ],
            )

    # ── 8. CampaignMember.convertedToOpportunity → opportunity ────────────────
    opportunity_id = objects.get('opportunity', {}).get('id')

    _create_relation(client, dry_run,
                     source_id=member_id_resolved, name='convertedToOpportunity',
                     label='Converted to opportunity', icon='IconTrendingUp', rel_type='MANY_TO_ONE',
                     target_id=opportunity_id,
                     reverse_label='Sourcing campaign members', reverse_icon='IconUsers')

    # ── 9. Opportunity.primaryCampaignSource → campaign ───────────────────────
    if not opportunity_id:
        print('  [error] opportunity object not found — cannot create primaryCampaignSource')
    else:
        _create_relation(client, dry_run,
                         source_id=opportunity_id, name='primaryCampaignSource',
                         label='Primary campaign source', icon='IconTargetArrow', rel_type='MANY_TO_ONE',
                         target_id=campaign_id_resolved,
                         reverse_label='Sourced opportunities', reverse_icon='IconTrendingUp')
