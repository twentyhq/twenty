import { msg } from '@lingui/core/macro';
import { IconHeartHandshake } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const grantRow = (
  id: string,
  name: string,
  funder: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  amount: string,
  reportDue: string,
  owner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'green' },
    funder: { type: 'entity', name: funder },
    status: { type: 'select', ...status },
    amount: { type: 'currency', value: amount },
    reportDue: { type: 'text', value: reportDue },
    owner: { type: 'person', name: owner, kind: 'person', tone: 'gray' },
  },
});

export const NONPROFIT_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'nonprofit',
  status: 'draft',
  name: msg`Nonprofit`,
  menu: {
    description: msg`Grants, gifts and programs`,
    icon: IconHeartHandshake,
  },
  meta: {
    title: msg`Twenty for nonprofits — a CRM that ties every gift to its program`,
    description: msg`Model funders, grants, programs, gifts and reports in an open source CRM. See an example nonprofit workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every grant, gift and report, *tied to the work it pays for*`,
    body: msg`Restricted gifts land in the right program, and reports start from the record. Here is an example nonprofit workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Riverbend Literacy Trust',
    tableObjectId: 'grant',
    viewName: 'Active grants',
    columns: [
      { id: 'name', label: 'Grant', width: 190, isFirstColumn: true },
      { id: 'funder', label: 'Funder', width: 170 },
      { id: 'status', label: 'Status', width: 120 },
      { id: 'amount', label: 'Amount', width: 120, align: 'right' },
      { id: 'reportDue', label: 'Next report', width: 130 },
      { id: 'owner', label: 'Owner', width: 150 },
    ],
    rows: [
      grantRow(
        'reading-corps',
        'Reading Corps 2026',
        'Halvorsen Family Fund',
        { value: 'Reporting', color: 'amber' },
        '$120,000',
        'In 12 days',
        'Dana Whitfield',
      ),
      grantRow(
        'summer-bridge',
        'Summer Bridge',
        'Coastal Community Foundation',
        { value: 'Active', color: 'green' },
        '$45,000',
        'Mar 31, 2027',
        'Luis Ortega',
      ),
      grantRow(
        'family-nights',
        'Family Literacy Nights',
        'Pinecrest Bank Giving',
        { value: 'Active', color: 'green' },
        '$18,500',
        'Feb 15, 2027',
        'Amara Osei',
      ),
      grantRow(
        'tutor-training',
        'Tutor Training Pilot',
        'Marlowe Foundation',
        { value: 'Pending', color: 'blue' },
        '$60,000',
        'Not started',
        'Dana Whitfield',
      ),
      grantRow(
        'book-bank',
        'Book Bank Expansion',
        'Northfield Rotary Trust',
        { value: 'Closed', color: 'gray' },
        '$25,000',
        'Submitted',
        'Luis Ortega',
      ),
    ],
    record: {
      name: 'Reading Corps 2026',
      createdAt: 'Added Jan 9',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'amber', value: 'Reporting' },
        },
        { label: 'Amount', value: { type: 'currency', value: '$120,000' } },
        { label: 'Next report', value: { type: 'text', value: 'In 12 days' } },
        {
          label: 'Owner',
          value: { type: 'person', name: 'Dana Whitfield', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Moving from NPSP to Nonprofit Cloud is a whole new project.`,
      answer: msg`If you are re-implementing anyway, move to a model you own and can change yourself.`,
      answeredBy: 'switching',
    },
    {
      complaint: msg`Restricted money ends up in the wrong program.`,
      answer: msg`A restricted gift cannot be saved without the program it funds.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Grant reports take a week each.`,
      answer: msg`An agent turns program updates and budget lines into a first draft.`,
      answeredBy: 'agents',
    },
    {
      complaint: msg`Only our consultant understands our setup.`,
      answer: msg`Objects, fields and workflows are edited in settings, by your own staff.`,
      answeredBy: 'workflows',
    },
  ],
  dataModel: {
    heading: msg`Model the money *the way your funders ask about it*`,
    objects: [
      {
        id: 'funder',
        label: msg`Funders`,
        purpose: msg`A foundation, company or agency that gives grants. Companies work too.`,
        fields: [
          { label: msg`Funding focus` },
          { label: msg`Reporting calendar` },
          { label: msg`Program officer`, relatesTo: 'person' },
        ],
        previewIcon: 'buildingSkyscraper',
        previewTone: 'blue',
      },
      {
        id: 'grant',
        label: msg`Grants`,
        purpose: msg`One award, with its amount, restrictions and report dates.`,
        fields: [
          { label: msg`Amount` },
          { label: msg`Restriction` },
          { label: msg`Funder`, relatesTo: 'funder' },
          { label: msg`Program`, relatesTo: 'program' },
        ],
        previewIcon: 'coins',
        previewTone: 'green',
      },
      {
        id: 'program',
        label: msg`Programs`,
        purpose: msg`The work the money pays for, with its budget and lead.`,
        fields: [
          { label: msg`Annual budget` },
          { label: msg`Program lead`, relatesTo: 'person' },
        ],
        previewIcon: 'targetArrow',
        previewTone: 'purple',
      },
      {
        id: 'gift',
        label: msg`Gifts`,
        purpose: msg`A donation from a person, restricted or not.`,
        fields: [
          { label: msg`Amount` },
          { label: msg`Received on` },
          { label: msg`Donor`, relatesTo: 'person' },
          { label: msg`Program`, relatesTo: 'program' },
        ],
        previewIcon: 'tag',
        previewTone: 'amber',
      },
      {
        id: 'report',
        label: msg`Reports`,
        purpose: msg`What a funder expects back, and when.`,
        fields: [
          { label: msg`Due on` },
          { label: msg`Status` },
          { label: msg`Grant`, relatesTo: 'grant' },
        ],
        previewIcon: 'fileText',
        previewTone: 'gray',
      },
    ],
    notes: [
      {
        title: msg`Donors are people`,
        body: msg`Individual donors live in People, with every gift and contact attached.`,
      },
      {
        title: msg`Programs connect the money`,
        body: msg`Grants and gifts both point at a program, so spend can be read per program.`,
      },
      {
        title: msg`Rules keep data honest`,
        body: msg`A restricted gift cannot be saved without the program it funds.`,
      },
    ],
  },
  workflows: {
    heading: msg`Deadlines are watched. *Your team writes the story*`,
    items: [
      {
        title: msg`Report deadline watch`,
        outcome: msg`No funder report is started the week it is due.`,
        steps: [
          { kind: 'trigger', label: msg`Every Monday at 08:00` },
          {
            kind: 'action',
            label: msg`Find grants with reports due in 30 days`,
          },
          { kind: 'agent', label: msg`Draft the report` },
          { kind: 'action', label: msg`Create a task for the grant owner` },
        ],
      },
      {
        title: msg`Gift received`,
        outcome: msg`Every donor is thanked, and large gifts get a personal call.`,
        steps: [
          { kind: 'trigger', label: msg`Gift is created` },
          { kind: 'action', label: msg`Send a thank-you email` },
          { kind: 'action', label: msg`If the gift is large, create a task` },
        ],
      },
      {
        title: msg`Lapsed donor`,
        outcome: msg`Donors who stop giving hear from a person, not silence.`,
        steps: [
          { kind: 'trigger', label: msg`Every month on the 1st` },
          { kind: 'action', label: msg`Find donors with no gift in 13 months` },
          { kind: 'action', label: msg`Create a task to re-engage` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents write the first draft. *People sign the report*`,
    items: [
      {
        name: msg`Grant writer`,
        job: msg`Turns program updates and budget lines into a first report draft, and flags spend ahead of plan.`,
        reads: ['grant', 'program', 'report', 'gift'],
        writes: ['note'],
        limit: msg`Drafts reports but cannot submit them.`,
      },
    ],
  },
  customScreen: {
    title: msg`Budget against spend`,
    placedOn: 'grant',
    description: msg`Compares each budget line with spend to date, so drift shows before the report.`,
    preview: {
      tabLabel: 'Budget',
      title: 'Budget against spend',
      caption: 'Month 9 of 12',
      columns: ['Budget line', 'Budget', 'Spent', 'Status'],
      rows: [
        {
          id: 'tutors',
          cells: [
            { type: 'text', value: 'Tutor stipends' },
            { type: 'currency', value: '$72,000' },
            { type: 'currency', value: '$53,400' },
            { type: 'select', color: 'green', value: 'On plan' },
          ],
        },
        {
          id: 'books',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Books and materials' },
            { type: 'currency', value: '$18,000' },
            { type: 'currency', value: '$17,100' },
            { type: 'select', color: 'amber', value: 'Ahead of plan' },
          ],
        },
        {
          id: 'evaluation',
          cells: [
            { type: 'text', value: 'Evaluation' },
            { type: 'currency', value: '$30,000' },
            { type: 'currency', value: '$12,000' },
            { type: 'select', color: 'blue', value: 'Behind plan' },
          ],
        },
      ],
      footnote:
        'Books are at 95% with a quarter left: raise it with the funder now.',
    },
  },
  access: {
    heading: msg`Each team sees its work. *Donor records stay private*`,
    roles: [
      { id: 'programStaff', label: msg`Program staff` },
      { id: 'finance', label: msg`Finance` },
      { id: 'development', label: msg`Development` },
    ],
    rules: [
      {
        objectId: 'grant',
        accessByRoleId: {
          programStaff: msg`Own program, amounts hidden`,
          finance: msg`See all, edit amounts`,
          development: msg`See and edit all`,
        },
      },
      {
        objectId: 'gift',
        accessByRoleId: {
          programStaff: msg`No access`,
          finance: msg`See all`,
          development: msg`See and edit all`,
        },
      },
      {
        objectId: 'person',
        accessByRoleId: {
          programStaff: msg`Major donors hidden`,
          finance: msg`Major donors hidden`,
          development: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Nonprofit Cloud',
    mappings: [
      { salesforceObject: 'Account (Household)', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity (Donation)', objectId: 'gift' },
      { salesforceObject: 'GAU Allocation', objectId: 'program' },
    ],
    note: msg`Coming from NPSP, GAU allocations become the link between a gift and its program. [Test this mapping on a real NPSP export.]`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Is there a nonprofit discount?`,
      answer: msg`[Placeholder for the pricing team.]`,
    },
    {
      question: msg`Can donors give online?`,
      answer: msg`Keep your donation platform. Send each gift into Twenty through a webhook, and the thank-you workflow runs.`,
    },
    {
      question: msg`Salesforce gives us free licences.`,
      answer: msg`The licences are free, the re-implementation is not. Choose on fit and on who can change the system.`,
    },
    {
      question: msg`Who owns our donor data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`Are you on NPSP or Nonprofit Cloud, and when does your contract renew?`,
      shapes: msg`Sets the timeline and the import plan.`,
    },
    {
      question: msg`How much of your funding is restricted?`,
      shapes: msg`Decides how strict the gift and program rules are.`,
    },
    {
      question: msg`How many funders report on a fixed calendar?`,
      shapes: msg`Sets up the report deadline watch.`,
    },
    {
      question: msg`Who maintains Salesforce today?`,
      shapes: msg`Tells us who will own the workspace and its roles.`,
    },
    {
      question: msg`What does a grant report take to write?`,
      shapes: msg`Their answer is the grant writer agent's job.`,
    },
  ],
};
