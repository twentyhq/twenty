import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const membershipRow = (
  id: string,
  member: string,
  tier: string,
  chapter: string,
  status: { value: string; color: 'amber' | 'green' | 'red' | 'blue' },
  renewsOn: string,
  dues: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'person', name: member, kind: 'person', tone: 'teal' },
    tier: { type: 'text', value: tier },
    chapter: { type: 'text', value: chapter },
    status: { type: 'select', ...status },
    renewsOn: { type: 'text', value: renewsOn },
    dues: { type: 'currency', value: dues },
  },
});

export const MEMBERSHIP_ASSOCIATIONS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'membership-associations',
  parentSlug: 'nonprofit',
  status: 'draft',
  name: msg`Membership associations`,
  meta: {
    title: msg`Twenty for membership associations`,
    description: msg`Track members, memberships, chapters and event registrations in an open source CRM. See an example association workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Renewals on time, *every member known*`,
    body: msg`Renewal reminders go out on schedule, and chapter leads see who is drifting away. Here is an example association workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Cascadia Guild of Bookbinders',
    tableObjectId: 'membership',
    viewName: 'Renewing in 60 days',
    columns: [
      { id: 'name', label: 'Member', width: 180, isFirstColumn: true },
      { id: 'tier', label: 'Tier', width: 110 },
      { id: 'chapter', label: 'Chapter', width: 130 },
      { id: 'status', label: 'Status', width: 120 },
      { id: 'renewsOn', label: 'Renews on', width: 120 },
      { id: 'dues', label: 'Dues', width: 90, align: 'right' },
    ],
    rows: [
      membershipRow(
        'nakamura',
        'Theo Nakamura',
        'Professional',
        'Portland',
        { value: 'Reminder sent', color: 'amber' },
        'Dec 14, 2026',
        '$240',
      ),
      membershipRow(
        'bianchi',
        'Lucia Bianchi',
        'Fellow',
        'Seattle',
        { value: 'Renewed', color: 'green' },
        'Dec 20, 2026',
        '$380',
      ),
      membershipRow(
        'okafor',
        'Chidi Okafor',
        'Student',
        'Vancouver',
        { value: 'Due', color: 'blue' },
        'Jan 3, 2027',
        '$60',
      ),
      membershipRow(
        'lindqvist',
        'Elsa Lindqvist',
        'Professional',
        'Portland',
        { value: 'Lapsed', color: 'red' },
        'Nov 2, 2026',
        '$240',
      ),
      membershipRow(
        'harrow',
        'Marcus Harrow',
        'Professional',
        'Seattle',
        { value: 'Due', color: 'blue' },
        'Jan 11, 2027',
        '$240',
      ),
    ],
    record: {
      name: 'Theo Nakamura',
      createdAt: 'Member since 2021',
      fields: [
        {
          label: 'Engagement',
          value: { type: 'select', color: 'amber', value: 'Cooling' },
        },
        { label: 'Tier', value: { type: 'text', value: 'Professional' } },
        { label: 'Chapter', value: { type: 'text', value: 'Portland' } },
        {
          label: 'Chapter lead',
          value: { type: 'person', name: 'Wendell Price', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Renewal reminders depend on someone remembering.`,
      answer: msg`Thirty days before a membership ends, a renewal email sequence starts on its own.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Event sign-ups live in another tool.`,
      answer: msg`Keep the event platform. Each registration arrives through a webhook and lands on the member.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We only learn a member is unhappy when they leave.`,
      answer: msg`An engagement score on each member shows who is cooling off.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Chapter leads see the whole member list.`,
      answer: msg`Row-level rules limit each chapter lead to the members of their chapter.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'member',
      label: msg`Members`,
      purpose: msg`A person's standing in the association, with their chapter and engagement.`,
      fields: [
        { label: msg`Member since` },
        { label: msg`Engagement score` },
        { label: msg`Person`, relatesTo: 'person' },
        { label: msg`Chapter`, relatesTo: 'chapter' },
      ],
      previewIcon: 'user',
      previewTone: 'teal',
    },
    {
      id: 'membership',
      label: msg`Memberships`,
      purpose: msg`One term of membership, with its tier, dues and end date.`,
      fields: [
        { label: msg`Tier` },
        { label: msg`Dues` },
        { label: msg`Ends on` },
        { label: msg`Member`, relatesTo: 'member' },
      ],
      previewIcon: 'key',
      previewTone: 'blue',
    },
    {
      id: 'chapter',
      label: msg`Chapters`,
      purpose: msg`A local group with its own lead and members.`,
      fields: [
        { label: msg`Region` },
        { label: msg`Chapter lead`, relatesTo: 'person' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'purple',
    },
    {
      id: 'eventRegistration',
      label: msg`Event registrations`,
      purpose: msg`One member signed up for one event, and whether they came.`,
      fields: [
        { label: msg`Event name` },
        { label: msg`Attended` },
        { label: msg`Member`, relatesTo: 'member' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'amber',
    },
  ],
  omittedObjectIds: ['funder', 'grant', 'program', 'gift', 'report'],
  modelNotes: [
    {
      title: msg`A member is a person`,
      body: msg`Each member links to their person record, so emails and meetings land in one place.`,
    },
    {
      title: msg`Each term is a membership`,
      body: msg`Every renewal adds a membership with its tier and dues, so the history stays on file.`,
    },
    {
      title: msg`Chapters draw the lines`,
      body: msg`Members belong to a chapter, which decides what each chapter lead can see.`,
    },
  ],
  workflows: [
    {
      title: msg`Renewal sequence`,
      outcome: msg`Every member hears about renewal twice before their membership ends.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find memberships ending in 30 days` },
        { kind: 'action', label: msg`Send the renewal email` },
        { kind: 'action', label: msg`Wait 14 days` },
        { kind: 'action', label: msg`If not renewed, send a reminder` },
      ],
    },
    {
      title: msg`Event registration`,
      outcome: msg`Every sign-up is on the member's record, confirmed within minutes.`,
      steps: [
        { kind: 'trigger', label: msg`Webhook from the event platform` },
        { kind: 'action', label: msg`Find the member by email` },
        { kind: 'action', label: msg`Create the event registration` },
        { kind: 'action', label: msg`Send a confirmation email` },
      ],
    },
    {
      title: msg`Lapsed member`,
      outcome: msg`A lapsed member hears from their chapter lead, not a form letter.`,
      steps: [
        { kind: 'trigger', label: msg`Membership status becomes Lapsed` },
        { kind: 'action', label: msg`Find the member's chapter lead` },
        { kind: 'action', label: msg`Create a task for the chapter lead` },
      ],
    },
  ],
  customScreen: {
    title: msg`Engagement score`,
    placedOn: 'member',
    description: msg`Breaks a member's score into events, renewals and volunteering, so a drop has a reason.`,
    preview: {
      tabLabel: 'Engagement',
      title: 'Engagement score',
      caption: 'Score 54 of 100, down from 78',
      columns: ['Signal', 'Last 12 months', 'Points', 'Trend'],
      rows: [
        {
          id: 'events',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Events attended' },
            { type: 'number', value: '1' },
            { type: 'number', value: '10' },
            { type: 'select', color: 'red', value: 'Down' },
          ],
        },
        {
          id: 'renewals',
          cells: [
            { type: 'text', value: 'Renewed on time' },
            { type: 'number', value: '5 of 5' },
            { type: 'number', value: '30' },
            { type: 'select', color: 'green', value: 'Steady' },
          ],
        },
        {
          id: 'volunteering',
          cells: [
            { type: 'text', value: 'Volunteer hours' },
            { type: 'number', value: '4' },
            { type: 'number', value: '14' },
            { type: 'select', color: 'amber', value: 'Down' },
          ],
        },
      ],
      footnote:
        'Came to one event this year, down from six. Worth a call before renewal.',
    },
  },
  agents: {
    heading: msg`Agents spot who is drifting. *Chapter leads reach out*`,
    items: [
      {
        name: msg`Renewal assistant`,
        job: msg`Reads a member's events and score before renewal, and drafts a personal note for members who are cooling off.`,
        reads: ['member', 'membership', 'eventRegistration'],
        writes: ['note', 'task'],
        limit: msg`Drafts notes but cannot change dues or send email.`,
      },
      {
        name: msg`Chapter digest`,
        job: msg`Writes each chapter lead a monthly summary of renewals, lapses and event turnout.`,
        reads: ['chapter', 'member', 'membership', 'eventRegistration'],
        writes: ['note'],
        limit: msg`Sees one chapter at a time, like the lead it writes for.`,
      },
    ],
  },
  access: {
    heading: msg`Chapter leads see their chapter. *Staff see the whole association*`,
    roles: [
      { id: 'chapterLead', label: msg`Chapter lead` },
      { id: 'membershipTeam', label: msg`Membership team` },
      { id: 'finance', label: msg`Finance` },
    ],
    rules: [
      {
        objectId: 'member',
        accessByRoleId: {
          chapterLead: msg`Own chapter only`,
          membershipTeam: msg`See and edit all`,
          finance: msg`See all`,
        },
      },
      {
        objectId: 'membership',
        accessByRoleId: {
          chapterLead: msg`Own chapter, dues hidden`,
          membershipTeam: msg`See and edit all`,
          finance: msg`See all, edit dues`,
        },
      },
      {
        objectId: 'eventRegistration',
        accessByRoleId: {
          chapterLead: msg`Own chapter only`,
          membershipTeam: msg`See and edit all`,
          finance: msg`No access`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Nonprofit Cloud',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Membership (custom)', objectId: 'membership' },
      { salesforceObject: 'Campaign Member', objectId: 'eventRegistration' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  discovery: [
    {
      question: msg`How many members do you have, and on which tiers?`,
      shapes: msg`Sets the membership tiers, dues fields and views.`,
    },
    {
      question: msg`How do renewals work today?`,
      shapes: msg`Sets the timing and wording of the renewal sequence.`,
    },
    {
      question: msg`Which event platform do you use?`,
      shapes: msg`Decides how registrations arrive: webhook, API or import.`,
    },
    {
      question: msg`How are chapters organized, and who leads them?`,
      shapes: msg`Sets the chapter lead role and its row-level rules.`,
    },
    {
      question: msg`What tells you a member is engaged?`,
      shapes: msg`Those signals become the engagement score.`,
    },
  ],
  categoryQuestions: 'omit',
  questions: [
    {
      question: msg`How is the engagement score worked out?`,
      answer: msg`You choose the signals and weights. A scheduled workflow with a code step updates the score on each member.`,
    },
    {
      question: msg`Can we bring our member list with us?`,
      answer: msg`Import members, memberships and chapters from CSV, or load them through the API.`,
    },
    {
      question: msg`Can members pay dues online?`,
      answer: msg`Keep your payment tool. Each payment reaches a workflow through a webhook and renews the membership.`,
    },
    {
      question: msg`Who owns our member data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
};
