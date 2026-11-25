import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const matterRow = (
  id: string,
  name: string,
  client: string,
  practiceArea: string,
  conflictCheck: { value: string; color: 'amber' | 'green' | 'red' | 'gray' },
  partner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    client: { type: 'entity', name: client },
    practiceArea: { type: 'text', value: practiceArea },
    conflictCheck: { type: 'select', ...conflictCheck },
    partner: { type: 'person', name: partner, kind: 'person', tone: 'gray' },
  },
});

export const LAW_FIRMS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'law-firms',
  parentSlug: 'professional-services',
  status: 'draft',
  name: msg`Law firms`,
  meta: {
    title: msg`Twenty for law firms`,
    description: msg`Track matters, conflict checks, engagement letters and referral sources in an open source CRM. See an example law firm workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every new matter *cleared before it starts*`,
    body: msg`Matters, conflict checks, engagement letters and referral sources in one workspace. Here is an example law firm workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Whitlock Penhale',
    tableObjectId: 'matter',
    viewName: 'New matters',
    columns: [
      { id: 'name', label: 'Matter', width: 210, isFirstColumn: true },
      { id: 'client', label: 'Client', width: 160 },
      { id: 'practiceArea', label: 'Practice area', width: 140 },
      { id: 'conflictCheck', label: 'Conflict check', width: 140 },
      { id: 'partner', label: 'Responsible partner', width: 170 },
    ],
    rows: [
      matterRow(
        'supply-dispute',
        'Supply agreement dispute',
        'Merrow Textiles',
        'Litigation',
        { value: 'Cleared', color: 'green' },
        'Imogen Hart',
      ),
      matterRow(
        'series-b',
        'Series B financing',
        'Tenbury Labs',
        'Corporate',
        { value: 'Pending', color: 'amber' },
        'Owen Castellano',
      ),
      matterRow(
        'lease-renewal',
        'Lease renewal',
        'Saltmarsh Bakeries',
        'Real estate',
        { value: 'Cleared', color: 'green' },
        'Imogen Hart',
      ),
      matterRow(
        'tribunal-claim',
        'Employment tribunal claim',
        'Hollins Care Homes',
        'Employment',
        { value: 'Flagged', color: 'red' },
        'Ravi Menon',
      ),
      matterRow(
        'trademark-review',
        'Trademark portfolio review',
        'Northgate Cycles',
        'Intellectual property',
        { value: 'Not started', color: 'gray' },
        'Ravi Menon',
      ),
    ],
    record: {
      name: 'Series B financing',
      createdAt: 'Added Nov 16',
      fields: [
        {
          label: 'Conflict check',
          value: { type: 'select', color: 'amber', value: 'Pending' },
        },
        { label: 'Client', value: { type: 'text', value: 'Tenbury Labs' } },
        { label: 'Practice area', value: { type: 'text', value: 'Corporate' } },
        {
          label: 'Engagement letter',
          value: { type: 'text', value: 'Sent Nov 18' },
        },
        {
          label: 'Responsible partner',
          value: { type: 'person', name: 'Owen Castellano', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Conflict checks live in a spreadsheet nobody trusts.`,
      answer: msg`Every intake creates a conflict check, and an agent searches people and companies for related parties.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Partners can't see why a conflict was cleared.`,
      answer: msg`The results sit on the matter, with each match and the decision next to it.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Work starts before the engagement letter is signed.`,
      answer: msg`Engagement letters are records with sent and signed dates, so unsigned ones are a view.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Not everyone in the firm should see every matter.`,
      answer: msg`Row-level rules can limit each matter to the people staffed on it.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'matter',
      label: msg`Matters`,
      purpose: msg`A piece of legal work for a client, with a practice area and a responsible partner.`,
      fields: [
        { label: msg`Practice area` },
        { label: msg`Opened on` },
        { label: msg`Client`, relatesTo: 'company' },
        { label: msg`Referral source`, relatesTo: 'referralSource' },
      ],
      previewIcon: 'folder',
      previewTone: 'blue',
    },
    {
      id: 'conflictCheck',
      label: msg`Conflict checks`,
      purpose: msg`The search run before a matter opens, with the parties checked and the decision.`,
      fields: [
        { label: msg`Related parties` },
        { label: msg`Decision` },
        { label: msg`Cleared by` },
        { label: msg`Matter`, relatesTo: 'matter' },
      ],
      previewIcon: 'search',
      previewTone: 'red',
    },
    {
      id: 'referralSource',
      label: msg`Referral sources`,
      purpose: msg`Who sent the work, so the firm can thank them and see which relationships bring matters.`,
      fields: [
        { label: msg`Matters referred` },
        { label: msg`Person`, relatesTo: 'person' },
        { label: msg`Company`, relatesTo: 'company' },
      ],
      previewIcon: 'tag',
      previewTone: 'pink',
    },
    {
      id: 'engagementLetter',
      label: msg`Engagement letters`,
      purpose: msg`The terms sent to the client, with a fee basis, a sent date and a signed date.`,
      fields: [
        { label: msg`Fee basis` },
        { label: msg`Sent on` },
        { label: msg`Signed on` },
        { label: msg`Matter`, relatesTo: 'matter' },
      ],
      previewIcon: 'notes',
      previewTone: 'teal',
    },
  ],
  omittedObjectIds: [
    'proposal',
    'engagement',
    'consultant',
    'assignment',
    'rateCard',
  ],
  modelNotes: [
    {
      title: msg`A matter is the unit of work`,
      body: msg`Client, parties, engagement letter and documents all hang off the matter.`,
    },
    {
      title: msg`Conflict checks are records`,
      body: msg`Each check keeps who searched, what matched and who cleared it, so the decision has a trail.`,
    },
    {
      title: msg`Referrals are tracked`,
      body: msg`Every matter points to its referral source, so you know which firms and clients send work.`,
    },
  ],
  workflows: [
    {
      title: msg`New matter intake`,
      outcome: msg`No matter opens before its conflict check has a decision.`,
      steps: [
        {
          kind: 'trigger',
          label: msg`Intake is started from the Matters list`,
        },
        { kind: 'action', label: msg`Fill in the intake form` },
        {
          kind: 'action',
          label: msg`Create the matter and its conflict check`,
        },
        {
          kind: 'agent',
          label: msg`Conflict agent searches people and companies for related parties`,
        },
        {
          kind: 'action',
          label: msg`Create a review task for the responsible partner`,
        },
      ],
    },
    {
      title: msg`Engagement letter unsigned`,
      outcome: msg`No letter sits unsigned for more than a week without a follow-up.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:30` },
        {
          kind: 'action',
          label: msg`Find letters sent 7 days ago and still unsigned`,
        },
        { kind: 'action', label: msg`Email the client contact a reminder` },
        {
          kind: 'action',
          label: msg`Create a follow-up task for the responsible partner`,
        },
      ],
    },
    {
      title: msg`Referral thank-you`,
      outcome: msg`Every referrer hears back the day their matter opens.`,
      steps: [
        { kind: 'trigger', label: msg`Matter status is set to Open` },
        { kind: 'action', label: msg`Find the matter's referral source` },
        { kind: 'action', label: msg`Send a thank-you email from the partner` },
        {
          kind: 'action',
          label: msg`Add one to the referrer's matters referred`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Conflict check results`,
    placedOn: 'matter',
    description: msg`Lists every related party searched for the matter, where it was found and the decision taken.`,
    preview: {
      tabLabel: 'Conflicts',
      title: 'Conflict check results',
      caption: 'Parties searched across people, companies and matters',
      columns: ['Related party', 'Role', 'Match', 'Decision'],
      rows: [
        {
          id: 'brookvale',
          highlighted: true,
          cells: [
            { type: 'entity', name: 'Brookvale Ventures' },
            { type: 'text', value: 'Lead investor' },
            { type: 'text', value: 'Former client, closed matter' },
            { type: 'select', color: 'amber', value: 'Review' },
          ],
        },
        {
          id: 'achebe',
          cells: [
            { type: 'person', name: 'Martin Achebe', kind: 'person' },
            { type: 'text', value: 'Board member' },
            { type: 'text', value: 'No match' },
            { type: 'select', color: 'green', value: 'Clear' },
          ],
        },
        {
          id: 'calder',
          cells: [
            { type: 'entity', name: 'Calder Growth Fund' },
            { type: 'text', value: 'Co-investor' },
            { type: 'text', value: 'No match' },
            { type: 'select', color: 'green', value: 'Clear' },
          ],
        },
      ],
      footnote: 'Brookvale Ventures needs a partner decision before opening.',
    },
  },
  agents: {
    heading: msg`Agents that run the search. *Partners make the decision*`,
    items: [
      {
        name: msg`Conflict searcher`,
        job: msg`Searches people, companies and past matters for every party named at intake and lists each match.`,
        reads: ['person', 'company', 'matter', 'conflictCheck'],
        writes: ['conflictCheck', 'note'],
        limit: msg`Lists matches only. A partner clears or declines the matter.`,
      },
      {
        name: msg`Opening memo writer`,
        job: msg`Drafts the matter opening memo from the intake answers and conflict results.`,
        reads: ['matter', 'conflictCheck', 'note'],
        writes: ['note'],
        limit: msg`Runs under its own role, so it reads only the matters that role is granted.`,
      },
    ],
  },
  access: {
    heading: msg`Matter teams see their matters. *Intake sees only the parties*`,
    roles: [
      { id: 'associate', label: msg`Associate` },
      { id: 'partner', label: msg`Partner` },
      { id: 'intake', label: msg`Intake team` },
    ],
    rules: [
      {
        objectId: 'matter',
        accessByRoleId: {
          associate: msg`Staffed matters only`,
          partner: msg`Their matters and their team's`,
          intake: msg`Names and parties, no notes`,
        },
      },
      {
        objectId: 'conflictCheck',
        accessByRoleId: {
          associate: msg`No access`,
          partner: msg`See and decide on their matters`,
          intake: msg`See and edit all`,
        },
      },
      {
        objectId: 'engagementLetter',
        accessByRoleId: {
          associate: msg`See on staffed matters`,
          partner: msg`See and edit on their matters`,
          intake: msg`See status only`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'matter' },
      {
        salesforceObject: 'Engagement letter (custom)',
        objectId: 'engagementLetter',
      },
      {
        salesforceObject: 'Conflict check (custom)',
        objectId: 'conflictCheck',
      },
    ],
    note: msg`Custom intake records become matters with their conflict check. Bring closed matters too, so conflict searches cover them.`,
  },
  discovery: [
    {
      question: msg`How does a new matter reach the firm today?`,
      shapes: msg`Each step becomes part of the intake workflow.`,
    },
    {
      question: msg`Who runs conflict checks, and who clears them?`,
      shapes: msg`Sets the intake role and who decides on a conflict check.`,
    },
    {
      question: msg`Where do past matters and their parties live?`,
      shapes: msg`Decides what to import so conflict searches cover them.`,
    },
    {
      question: msg`Which matters must stay hidden inside the firm?`,
      shapes: msg`Sets the row-level rules on matters.`,
    },
    {
      question: msg`Which tools hold time, billing and documents?`,
      shapes: msg`Each tool becomes an HTTP request or an API sync.`,
    },
  ],
  questions: [
    {
      question: msg`Can a matter stay confidential inside the firm?`,
      answer: msg`A team can set row-level rules so only people staffed on a matter see it. Intake works from a role that sees party names, not notes.`,
    },
    {
      question: msg`Can conflict searches cover our past matters?`,
      answer: msg`Yes, once they are in Twenty. Import closed matters and their parties by CSV or through the API.`,
    },
  ],
  proof: { kind: 'none' },
};
