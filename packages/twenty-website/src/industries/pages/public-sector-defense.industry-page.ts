import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const tenderRow = (
  id: string,
  name: string,
  buyer: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  deadline: string,
  owner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    buyer: { type: 'entity', name: buyer },
    status: { type: 'select', ...status },
    deadline: { type: 'text', value: deadline },
    owner: { type: 'person', name: owner, kind: 'person', tone: 'gray' },
  },
});

export const PUBLIC_SECTOR_DEFENSE_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'public-sector-defense',
  status: 'draft',
  name: msg`Public sector and defense`,
  meta: {
    title: msg`Twenty for the public sector and defense — a CRM you control`,
    description: msg`Track programmes, tenders, approvals and partners in an open source CRM you can host on your own servers. See an example workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Serve, bid and comply from software *you control*`,
    body: msg`Programmes, tenders and approvals on servers you choose, with access you decide. Here is an example public sector workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Calder Regional Office',
    tableObjectId: 'tender',
    viewName: 'Open tenders',
    columns: [
      { id: 'name', label: 'Tender', width: 200, isFirstColumn: true },
      { id: 'buyer', label: 'Buyer', width: 190 },
      { id: 'status', label: 'Status', width: 130 },
      { id: 'deadline', label: 'Deadline', width: 130 },
      { id: 'owner', label: 'Bid owner', width: 160 },
    ],
    rows: [
      tenderRow(
        'records',
        'Records digitisation',
        'Halden County Council',
        { value: 'Go/no-go', color: 'amber' },
        'Jan 14, 2027',
        'Ines Moreau',
      ),
      tenderRow(
        'bridges',
        'Bridge inspection framework',
        'Northmere Transport Agency',
        { value: 'Drafting', color: 'blue' },
        'Feb 3, 2027',
        'Daniel Kerr',
      ),
      tenderRow(
        'helpdesk',
        'Citizen helpdesk support',
        'Office of Civic Services',
        { value: 'Drafting', color: 'blue' },
        'Feb 21, 2027',
        'Ines Moreau',
      ),
      tenderRow(
        'flood',
        'Flood sensor network',
        'Wexmoor Water Board',
        { value: 'Submitted', color: 'green' },
        'Dec 9, 2026',
        'Sofia Lind',
      ),
      tenderRow(
        'fleet',
        'Fleet maintenance',
        'Halden County Council',
        { value: 'No bid', color: 'gray' },
        'Closed',
        'Daniel Kerr',
      ),
    ],
    record: {
      name: 'Records digitisation',
      createdAt: 'Added Nov 12',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'amber', value: 'Go/no-go' },
        },
        {
          label: 'Buyer',
          value: { type: 'text', value: 'Halden County Council' },
        },
        { label: 'Deadline', value: { type: 'text', value: 'Jan 14, 2027' } },
        {
          label: 'Bid owner',
          value: { type: 'person', name: 'Ines Moreau', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our data can't sit on a foreign hyperscaler.`,
      answer: msg`Twenty is open source. Run it on your own servers, and move your data there from day one.`,
      answeredBy: 'switching',
    },
    {
      complaint: msg`Only cleared staff may see some records.`,
      answer: msg`Row-level rules hide restricted records from everyone outside the cleared role.`,
      answeredBy: 'access',
    },
    {
      complaint: msg`Licences and approvals expire mid-programme.`,
      answer: msg`A daily workflow finds what expires within 60 days and prepares the renewal.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Tender packs are hundreds of pages.`,
      answer: msg`An agent reads the pack, flags risky clauses and drafts the go/no-go memo.`,
      answeredBy: 'agents',
    },
  ],
  dataModel: {
    heading: msg`Model programmes and tenders, *not leads and deals*`,
    objects: [
      {
        id: 'programme',
        label: msg`Programmes`,
        purpose: msg`A funded body of work that runs for years and spans many contracts.`,
        fields: [
          { label: msg`Classification` },
          { label: msg`Budget` },
          { label: msg`Agency`, relatesTo: 'company' },
        ],
        previewIcon: 'folder',
        previewTone: 'purple',
      },
      {
        id: 'tender',
        label: msg`Tenders`,
        purpose: msg`One procurement, from publication to award, with a go/no-go decision.`,
        fields: [
          { label: msg`Deadline` },
          { label: msg`Decision` },
          { label: msg`Buyer`, relatesTo: 'company' },
          { label: msg`Programme`, relatesTo: 'programme' },
        ],
        previewIcon: 'fileText',
        previewTone: 'blue',
      },
      {
        id: 'partner',
        label: msg`Partners`,
        purpose: msg`A teaming arrangement with another organisation on a tender or programme.`,
        fields: [
          { label: msg`Role` },
          { label: msg`Work share` },
          { label: msg`Organisation`, relatesTo: 'company' },
        ],
        previewIcon: 'users',
        previewTone: 'teal',
      },
      {
        id: 'approval',
        label: msg`Approvals`,
        purpose: msg`A licence or approval you hold, with an issuer and an expiry.`,
        fields: [
          { label: msg`Type` },
          { label: msg`Expires on` },
          { label: msg`Programme`, relatesTo: 'programme' },
        ],
        previewIcon: 'shieldCheck',
        previewTone: 'green',
      },
    ],
    notes: [
      {
        title: msg`Agencies are companies`,
        body: msg`Buyers and partners share one company record, so every tender and contact stays attached.`,
      },
      {
        title: msg`Classification is a field`,
        body: msg`Each programme carries its level, and access rules read it.`,
      },
      {
        title: msg`Approvals have dates`,
        body: msg`An approval cannot be saved without an expiry, so workflows can watch it.`,
      },
    ],
  },
  workflows: {
    heading: msg`Deadlines watched for you. *Decisions stay with people*`,
    items: [
      {
        title: msg`Licence and approval watch`,
        outcome: msg`No approval lapses in the middle of a programme.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 07:00` },
          {
            kind: 'action',
            label: msg`Find approvals expiring within 60 days`,
          },
          { kind: 'agent', label: msg`Prepare the renewal file` },
          { kind: 'action', label: msg`Create a task for the programme lead` },
        ],
      },
      {
        title: msg`Tender published`,
        outcome: msg`Every relevant tender gets a go/no-go decision on time.`,
        steps: [
          { kind: 'trigger', label: msg`Webhook from a procurement portal` },
          { kind: 'action', label: msg`Create the tender record` },
          {
            kind: 'action',
            label: msg`Create a go/no-go task for the bid owner`,
          },
        ],
      },
      {
        title: msg`Access review`,
        outcome: msg`Someone checks who can see restricted programmes every quarter.`,
        steps: [
          { kind: 'trigger', label: msg`First day of each quarter` },
          { kind: 'action', label: msg`Find restricted programmes` },
          {
            kind: 'action',
            label: msg`Create a review task for the security owner`,
          },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents read the pack. *People decide to bid*`,
    items: [
      {
        name: msg`Bid desk`,
        job: msg`Reads the tender pack, flags risky clauses and drafts the go/no-go memo as a note.`,
        reads: ['tender', 'programme', 'approval'],
        writes: ['note'],
        limit: msg`Runs on your own AI provider and cannot submit a bid.`,
      },
    ],
  },
  customScreen: {
    title: msg`Bid readiness`,
    placedOn: 'tender',
    description: msg`Checks licences, approvals and local content before anyone submits.`,
    preview: {
      tabLabel: 'Readiness',
      title: 'Bid readiness',
      caption: 'Checked before submission',
      columns: ['Check', 'Status', 'Owner', 'Due'],
      rows: [
        {
          id: 'supplier',
          cells: [
            { type: 'text', value: 'Approved supplier status' },
            { type: 'select', color: 'green', value: 'Valid' },
            { type: 'person', name: 'Sofia Lind', kind: 'person' },
            { type: 'text', value: 'Done' },
          ],
        },
        {
          id: 'data-processing',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Data processing approval' },
            { type: 'select', color: 'amber', value: 'Expires Dec 30' },
            { type: 'person', name: 'Daniel Kerr', kind: 'person' },
            { type: 'text', value: 'Dec 20' },
          ],
        },
        {
          id: 'local-content',
          cells: [
            { type: 'text', value: 'Local content declaration' },
            { type: 'select', color: 'gray', value: 'Not started' },
            { type: 'person', name: 'Ines Moreau', kind: 'person' },
            { type: 'text', value: 'Jan 7' },
          ],
        },
      ],
      footnote:
        'The data processing approval lapses before award. Renew it first.',
    },
  },
  access: {
    heading: msg`Staff see their work. *Restricted records stay restricted*`,
    roles: [
      { id: 'staff', label: msg`Staff` },
      { id: 'clearedStaff', label: msg`Cleared staff` },
      { id: 'board', label: msg`Board` },
    ],
    rules: [
      {
        objectId: 'programme',
        accessByRoleId: {
          staff: msg`Unrestricted only, no finance`,
          clearedStaff: msg`Up to their clearance level, no finance`,
          board: msg`See all, including finance`,
        },
      },
      {
        objectId: 'tender',
        accessByRoleId: {
          staff: msg`See all, edit own`,
          clearedStaff: msg`See and edit all`,
          board: msg`See all`,
        },
      },
      {
        objectId: 'approval',
        accessByRoleId: {
          staff: msg`On unrestricted programmes`,
          clearedStaff: msg`See and edit all`,
          board: msg`See all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Public Sector Solutions',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Opportunity', objectId: 'tender' },
      { salesforceObject: 'Custom compliance objects', objectId: 'approval' },
    ],
    note: msg`Custom compliance objects map one to one. When you self-host, the migration can run inside your own network.`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Who can access our instance?`,
      answer: msg`When you self-host, only you. On the Enterprise plan, Twenty can run fully offline in an air-gapped network.`,
    },
    {
      question: msg`Can we use our own AI models?`,
      answer: msg`Yes. Custom AI providers are available on the Organization plan and above, so agents run on the models you approve.`,
    },
    {
      question: msg`Which certifications do you hold?`,
      answer: msg`[placeholder]`,
    },
    {
      question: msg`What if we stop working with Twenty?`,
      answer: msg`The code is open source and runs on your servers. You keep running it, and your data never has to leave.`,
    },
  ],
  discovery: [
    {
      question: msg`Where must the CRM run?`,
      shapes: msg`Decides cloud, self-hosted or air-gapped.`,
    },
    {
      question: msg`What classification levels do you handle?`,
      shapes: msg`Becomes the classification field and the row-level rules.`,
    },
    {
      question: msg`Which AI providers are approved?`,
      shapes: msg`Sets the provider the agents run on.`,
    },
    {
      question: msg`How do tenders reach you?`,
      shapes: msg`Each portal becomes a webhook or an import.`,
    },
    {
      question: msg`Who audits access?`,
      shapes: msg`Names the security owner in the access review.`,
    },
  ],
};
