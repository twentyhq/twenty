"""
load-campaign.py — Bulk-load CampaignMembers (and optional Tasks) from a CSV.

Run once per campaign launch. Reads a CSV of target people/companies and an
assignee per row, then for each row:
  1. Resolves the Person (by email) or Company (by name).
  2. Resolves the assignee WorkspaceMember (by email), falling back to
     campaign.defaultAssignee.
  3. Upserts a CampaignMember (idempotent on campaign + target).
  4. Optionally creates a Task targeting the same Person/Company, with title
     rendered from campaign.taskTitleTemplate and assignee from the member.
     Idempotent: skips if a task with the same title already exists on that
     target.

Usage:
    TWENTY_API_KEY=<key> python3 scripts/stratum/load-campaign.py \\
        --api-url https://twenty-uat-0a4c.up.railway.app/graphql \\
        --campaign-code Q2-NEWSLETTER \\
        --csv ./campaign-loads/q2-newsletter.csv \\
        [--dry-run] [--skip-tasks]

CSV columns (header row required):
    personEmail       — looks up Person by primaryEmail (exactly one of
    companyName       — looks up Company by name           personEmail OR
                                                           companyName per row)
    assigneeEmail     — optional; WorkspaceMember.userEmail
    touchType         — optional; one of EMAIL / CALL / MEETING / MAIL / EVENT / OTHER
    responseStatus    — optional; default TARGETED. One of TARGETED / CONTACTED /
                        ENGAGED / RESPONDED / CONVERTED / UNSUBSCRIBED
    priority          — optional; HIGH / MEDIUM / LOW
    dueDate           — optional; yyyy-MM-dd override per row. If absent, uses
                        campaign.startDate + campaign.taskDueDaysFromStart.
    notes             — optional; CampaignMember.notes
"""

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta


class WorkspaceClient:
    """Thin client for the workspace GraphQL endpoint (record reads + writes)."""

    def __init__(self, api_url: str, api_key: str):
        # workspace endpoint is the bare /graphql URL
        base = api_url.rstrip('/')
        if not base.endswith('/graphql'):
            base = f'{base}/graphql'
        self.url = base
        self.api_key = api_key

    def gql(self, query: str, variables: dict | None = None) -> dict:
        payload = json.dumps({'query': query, 'variables': variables or {}}).encode()
        req = urllib.request.Request(
            self.url,
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
        )
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
        if 'errors' in result:
            raise RuntimeError(f"GraphQL error: {result['errors']}")
        return result['data']


def find_campaign(client: WorkspaceClient, code: str) -> dict | None:
    q = '''
    query FindCampaign($code: String!) {
      campaigns(filter: { code: { eq: $code } }, first: 1) {
        edges { node {
          id name code startDate
          taskTitleTemplate taskDueDaysFromStart
          defaultAssigneeId
        } }
      }
    }
    '''
    data = client.gql(q, {'code': code})
    edges = data['campaigns']['edges']
    return edges[0]['node'] if edges else None


def find_person_by_email(client: WorkspaceClient, email: str) -> dict | None:
    q = '''
    query FindPerson($email: String!) {
      people(filter: { emails: { primaryEmail: { eq: $email } } }, first: 1) {
        edges { node { id name { firstName lastName } } }
      }
    }
    '''
    data = client.gql(q, {'email': email})
    edges = data['people']['edges']
    return edges[0]['node'] if edges else None


def find_company_by_name(client: WorkspaceClient, name: str) -> dict | None:
    q = '''
    query FindCompany($name: String!) {
      companies(filter: { name: { eq: $name } }, first: 1) {
        edges { node { id name } }
      }
    }
    '''
    data = client.gql(q, {'name': name})
    edges = data['companies']['edges']
    return edges[0]['node'] if edges else None


def find_workspace_member_by_email(client: WorkspaceClient, email: str) -> dict | None:
    q = '''
    query FindMember($email: String!) {
      workspaceMembers(filter: { userEmail: { eq: $email } }, first: 1) {
        edges { node { id userEmail } }
      }
    }
    '''
    data = client.gql(q, {'email': email})
    edges = data['workspaceMembers']['edges']
    return edges[0]['node'] if edges else None


def find_existing_member(client: WorkspaceClient, campaign_id: str, *, target_person_id: str | None, target_company_id: str | None) -> dict | None:
    if target_person_id:
        target_filter = f'targetPersonId: {{ eq: "{target_person_id}" }}'
    else:
        target_filter = f'targetCompanyId: {{ eq: "{target_company_id}" }}'
    q = f'''
    query FindMember {{
      campaignMembers(
        filter: {{ and: [
          {{ campaignId: {{ eq: "{campaign_id}" }} }},
          {{ {target_filter} }}
        ] }},
        first: 1
      ) {{
        edges {{ node {{ id }} }}
      }}
    }}
    '''
    data = client.gql(q)
    edges = data['campaignMembers']['edges']
    return edges[0]['node'] if edges else None


def find_task_by_title_on_target(client: WorkspaceClient, title: str, *, target_person_id: str | None, target_company_id: str | None) -> dict | None:
    # Walk via the target's taskTargets reverse relation
    if target_person_id:
        q = f'''
        query {{
          person(filter: {{ id: {{ eq: "{target_person_id}" }} }}) {{
            id
            taskTargets {{
              edges {{ node {{ task {{ id title }} }} }}
            }}
          }}
        }}
        '''
    else:
        q = f'''
        query {{
          company(filter: {{ id: {{ eq: "{target_company_id}" }} }}) {{
            id
            taskTargets {{
              edges {{ node {{ task {{ id title }} }} }}
            }}
          }}
        }}
        '''
    data = client.gql(q)
    obj = data.get('person') or data.get('company')
    if not obj:
        return None
    for edge in obj['taskTargets']['edges']:
        task = edge['node']['task']
        if task and task.get('title') == title:
            return task
    return None


def create_campaign_member(client: WorkspaceClient, *, campaign_id: str, target_person_id: str | None, target_company_id: str | None, assignee_id: str | None, touch_type: str | None, response_status: str, priority: str | None, notes: str | None) -> dict:
    data_obj = {
        'campaignId': campaign_id,
        'responseStatus': response_status,
        'dateAdded': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z'),
    }
    if target_person_id:
        data_obj['targetPersonId'] = target_person_id
    if target_company_id:
        data_obj['targetCompanyId'] = target_company_id
    if assignee_id:
        data_obj['assigneeId'] = assignee_id
    if touch_type:
        data_obj['touchType'] = touch_type
    if priority:
        data_obj['priority'] = priority
    if notes:
        data_obj['notes'] = notes

    q = '''
    mutation CreateMember($data: CampaignMemberCreateInput!) {
      createCampaignMember(data: $data) { id }
    }
    '''
    data = client.gql(q, {'data': data_obj})
    return data['createCampaignMember']


def create_task(client: WorkspaceClient, *, title: str, assignee_id: str | None, due_at: str | None, body: str | None) -> dict:
    data_obj = {
        'title': title,
        'status': 'TODO',
    }
    if assignee_id:
        data_obj['assigneeId'] = assignee_id
    if due_at:
        data_obj['dueAt'] = due_at
    if body:
        # Twenty's task body is a rich-text field; plain text works as-is
        data_obj['bodyV2'] = {'blocknote': body, 'markdown': body}

    q = '''
    mutation CreateTask($data: TaskCreateInput!) {
      createTask(data: $data) { id }
    }
    '''
    data = client.gql(q, {'data': data_obj})
    return data['createTask']


def link_task_to_target(client: WorkspaceClient, *, task_id: str, target_person_id: str | None, target_company_id: str | None) -> dict:
    # taskTarget uses the morph-variant naming targetPersonId / targetCompanyId
    data_obj = {'taskId': task_id}
    if target_person_id:
        data_obj['targetPersonId'] = target_person_id
    if target_company_id:
        data_obj['targetCompanyId'] = target_company_id

    q = '''
    mutation CreateTaskTarget($data: TaskTargetCreateInput!) {
      createTaskTarget(data: $data) { id }
    }
    '''
    data = client.gql(q, {'data': data_obj})
    return data['createTaskTarget']


def render_title(template: str | None, *, campaign: dict, person: dict | None, company: dict | None) -> str:
    if not template:
        template = 'Campaign: {{campaign.name}}'
    if person:
        n = person.get('name') or {}
        target_name = ' '.join(filter(None, [n.get('firstName'), n.get('lastName')])) or 'Unknown'
    elif company:
        target_name = company.get('name', 'Unknown')
    else:
        target_name = 'Unknown'

    out = template
    out = out.replace('{{person.name}}', target_name)
    out = out.replace('{{company.name}}', target_name)
    out = out.replace('{{campaign.name}}', campaign.get('name', ''))
    out = out.replace('{{campaign.code}}', campaign.get('code') or '')
    return out


def compute_due_at(*, row_due_date: str | None, campaign: dict) -> str | None:
    if row_due_date:
        return f'{row_due_date}T17:00:00.000Z'
    days = campaign.get('taskDueDaysFromStart')
    start = campaign.get('startDate')
    if days is None or not start:
        return None
    try:
        start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
        due_dt = start_dt + timedelta(days=int(days))
        return due_dt.strftime('%Y-%m-%dT17:00:00.000Z')
    except Exception:
        return None


def process_row(client: WorkspaceClient, campaign: dict, row: dict, *, dry_run: bool, skip_tasks: bool, counters: dict) -> None:
    person_email = (row.get('personEmail') or '').strip()
    company_name = (row.get('companyName') or '').strip()

    if bool(person_email) == bool(company_name):
        print(f'  [error] row needs exactly one of personEmail or companyName: {row}')
        counters['errors'] += 1
        return

    person = company = None
    if person_email:
        person = find_person_by_email(client, person_email)
        if not person:
            print(f'  [error] person not found: {person_email}')
            counters['errors'] += 1
            return
        target_id_kind = ('person', person['id'])
    else:
        company = find_company_by_name(client, company_name)
        if not company:
            print(f'  [error] company not found: {company_name}')
            counters['errors'] += 1
            return
        target_id_kind = ('company', company['id'])

    # Assignee resolution
    assignee_email = (row.get('assigneeEmail') or '').strip()
    assignee_id = None
    if assignee_email:
        m = find_workspace_member_by_email(client, assignee_email)
        if not m:
            print(f'  [warn]  assignee {assignee_email} not found — leaving member unassigned')
        else:
            assignee_id = m['id']
    if not assignee_id:
        assignee_id = campaign.get('defaultAssigneeId')

    target_person_id  = target_id_kind[1] if target_id_kind[0] == 'person'  else None
    target_company_id = target_id_kind[1] if target_id_kind[0] == 'company' else None

    target_label = person_email or company_name

    # Member idempotency
    existing = find_existing_member(
        client, campaign['id'],
        target_person_id=target_person_id,
        target_company_id=target_company_id,
    )
    if existing:
        print(f'  [skip]  member already exists for {target_label}')
        counters['members_skipped'] += 1
    else:
        response_status = (row.get('responseStatus') or 'TARGETED').strip().upper()
        touch_type = (row.get('touchType') or '').strip().upper() or None
        priority = (row.get('priority') or '').strip().upper() or None
        notes = (row.get('notes') or '').strip() or None
        print(f'  [create] member for {target_label} (status={response_status}, touch={touch_type or "-"}, priority={priority or "-"})')
        if not dry_run:
            create_campaign_member(
                client,
                campaign_id=campaign['id'],
                target_person_id=target_person_id,
                target_company_id=target_company_id,
                assignee_id=assignee_id,
                touch_type=touch_type,
                response_status=response_status,
                priority=priority,
                notes=notes,
            )
        counters['members_created'] += 1

    # Task creation
    if skip_tasks:
        return

    title = render_title(campaign.get('taskTitleTemplate'), campaign=campaign, person=person, company=company)
    existing_task = find_task_by_title_on_target(
        client, title,
        target_person_id=target_person_id,
        target_company_id=target_company_id,
    )
    if existing_task:
        print(f'  [skip]  task "{title}" already exists on {target_label}')
        counters['tasks_skipped'] += 1
        return

    due_at = compute_due_at(row_due_date=(row.get('dueDate') or '').strip() or None, campaign=campaign)
    print(f'  [create] task "{title}" for {target_label}' + (f' due {due_at[:10]}' if due_at else ''))
    if not dry_run:
        task = create_task(client, title=title, assignee_id=assignee_id, due_at=due_at, body=None)
        link_task_to_target(
            client,
            task_id=task['id'],
            target_person_id=target_person_id,
            target_company_id=target_company_id,
        )
    counters['tasks_created'] += 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-url', help='Twenty workspace GraphQL URL (e.g. https://twenty-uat-0a4c.up.railway.app/graphql). Defaults to TWENTY_API_URL env var.')
    parser.add_argument('--campaign-code', required=True, help='Campaign.code value to load into')
    parser.add_argument('--csv', required=True, help='Path to CSV file with member rows')
    parser.add_argument('--dry-run', action='store_true', help='Print actions without writing')
    parser.add_argument('--skip-tasks', action='store_true', help='Create CampaignMembers but no Tasks')
    args = parser.parse_args()

    api_url = args.api_url or os.environ.get('TWENTY_API_URL') or 'https://twenty-production-eea0.up.railway.app/graphql'
    api_key = os.environ.get('TWENTY_API_KEY', '')
    if not api_key:
        print('ERROR: Set TWENTY_API_KEY env var')
        sys.exit(1)

    client = WorkspaceClient(api_url, api_key)

    campaign = find_campaign(client, args.campaign_code)
    if not campaign:
        print(f'ERROR: campaign with code "{args.campaign_code}" not found at {api_url}')
        sys.exit(1)

    print(f'Target: {api_url}')
    print(f'Campaign: {campaign["name"]} (id={campaign["id"]}, code={campaign["code"]})')
    if args.dry_run:
        print('[DRY RUN] No changes will be made')
    print()

    counters = {
        'rows': 0,
        'members_created': 0,
        'members_skipped': 0,
        'tasks_created': 0,
        'tasks_skipped': 0,
        'errors': 0,
    }

    with open(args.csv, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            counters['rows'] += 1
            print(f'Row {counters["rows"]}: {row.get("personEmail") or row.get("companyName")}')
            try:
                process_row(client, campaign, row, dry_run=args.dry_run, skip_tasks=args.skip_tasks, counters=counters)
            except Exception as e:
                print(f'  [error] {e}')
                counters['errors'] += 1

    print()
    print('=== Summary ===')
    for k, v in counters.items():
        print(f'  {k:20s} {v}')

    if counters['errors']:
        sys.exit(2)


if __name__ == '__main__':
    main()
