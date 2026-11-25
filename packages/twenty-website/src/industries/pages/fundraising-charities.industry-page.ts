import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const campaignRow = (
  id: string,
  name: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  goal: string,
  raised: string,
  endsOn: string,
  owner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    status: { type: 'select', ...status },
    goal: { type: 'currency', value: goal },
    raised: { type: 'currency', value: raised },
    endsOn: { type: 'text', value: endsOn },
    owner: { type: 'person', name: owner, kind: 'person', tone: 'gray' },
  },
});

export const FUNDRAISING_CHARITIES_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'fundraising-charities',
  parentSlug: 'nonprofit',
  status: 'draft',
  name: msg`Fundraising charities`,
  meta: {
    title: msg`Twenty for fundraising charities`,
    description: msg`Track donors, campaigns, pledges, recurring gifts and events in an open source CRM. See an example charity workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every donor thanked, *every gift tracked*`,
    body: msg`Gifts, pledges and monthly donations sit on the donor's record, and thank-yous go out the day money arrives. Here is an example charity workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Kestrel Lane Food Bank',
    tableObjectId: 'campaign',
    viewName: 'Open campaigns',
    columns: [
      { id: 'name', label: 'Campaign', width: 190, isFirstColumn: true },
      { id: 'status', label: 'Status', width: 120 },
      { id: 'goal', label: 'Goal', width: 110, align: 'right' },
      { id: 'raised', label: 'Raised', width: 110, align: 'right' },
      { id: 'endsOn', label: 'Ends', width: 120 },
      { id: 'owner', label: 'Owner', width: 150 },
    ],
    rows: [
      campaignRow(
        'winter-appeal',
        'Winter Appeal 2026',
        { value: 'Live', color: 'green' },
        '$250,000',
        '$168,400',
        'Jan 31, 2027',
        'Priya Raman',
      ),
      campaignRow(
        'harvest-dinner',
        'Harvest Dinner',
        { value: 'Live', color: 'green' },
        '$80,000',
        '$71,250',
        'Dec 6, 2026',
        'Owen Kask',
      ),
      campaignRow(
        'giving-tuesday',
        'Giving Tuesday',
        { value: 'Planned', color: 'blue' },
        '$40,000',
        '$0',
        'Dec 1, 2026',
        'Priya Raman',
      ),
      campaignRow(
        'van-fund',
        'New Delivery Van',
        { value: 'Pledges due', color: 'amber' },
        '$65,000',
        '$52,800',
        'Mar 31, 2027',
        'Ingrid Solberg',
      ),
      campaignRow(
        'spring-drive',
        'Spring Food Drive',
        { value: 'Closed', color: 'gray' },
        '$30,000',
        '$34,120',
        'May 15, 2026',
        'Owen Kask',
      ),
    ],
    record: {
      name: 'Margaret Ellison',
      createdAt: 'Donor since 2019',
      fields: [
        {
          label: 'Lifetime giving',
          value: { type: 'currency', value: '$18,650' },
        },
        { label: 'Last gift', value: { type: 'text', value: 'Nov 18, 2026' } },
        {
          label: 'Monthly gift',
          value: { type: 'select', color: 'green', value: 'Active' },
        },
        {
          label: 'Relationship owner',
          value: { type: 'person', name: 'Ingrid Solberg', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Thank-you letters go out weeks after the gift.`,
      answer: msg`A new gift sends the thank-you and the receipt the same day.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Nobody notices when a pledge stops being paid.`,
      answer: msg`Each pledge has its instalments, and an overdue one sends a reminder.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Before a donor meeting we dig through five systems.`,
      answer: msg`A giving history tab on each donor shows every gift by year and campaign.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Our biggest donors get the same email as everyone else.`,
      answer: msg`A gift over your threshold sends the development lead a task and a briefing.`,
      answeredBy: 'agents',
    },
  ],
  addedObjects: [
    {
      id: 'campaign',
      label: msg`Campaigns`,
      purpose: msg`An appeal with a goal and dates, so every gift counts toward something.`,
      fields: [
        { label: msg`Goal` },
        { label: msg`Ends on` },
        { label: msg`Owner`, relatesTo: 'person' },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'orange',
    },
    {
      id: 'pledge',
      label: msg`Pledges`,
      purpose: msg`A promise to give in instalments, with what is paid and what is due.`,
      fields: [
        { label: msg`Total pledged` },
        { label: msg`Next instalment due` },
        { label: msg`Donor`, relatesTo: 'person' },
        { label: msg`Campaign`, relatesTo: 'campaign' },
      ],
      previewIcon: 'fileText',
      previewTone: 'blue',
    },
    {
      id: 'recurringGift',
      label: msg`Recurring gifts`,
      purpose: msg`A monthly or yearly donation, with its amount and status.`,
      fields: [
        { label: msg`Amount` },
        { label: msg`Frequency` },
        { label: msg`Status` },
        { label: msg`Donor`, relatesTo: 'person' },
      ],
      previewIcon: 'coins',
      previewTone: 'green',
    },
    {
      id: 'event',
      label: msg`Events`,
      purpose: msg`A dinner, run or gala, with its guests and what it raised.`,
      fields: [
        { label: msg`Date` },
        { label: msg`Venue` },
        { label: msg`Campaign`, relatesTo: 'campaign' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'pink',
    },
  ],
  workflows: [
    {
      title: msg`Gift received`,
      outcome: msg`Every donor gets a thank-you and a receipt the day the gift lands.`,
      steps: [
        { kind: 'trigger', label: msg`Gift is created` },
        { kind: 'action', label: msg`Send a thank-you email` },
        { kind: 'action', label: msg`Send the receipt by email` },
        { kind: 'action', label: msg`Update the donor's lifetime giving` },
      ],
    },
    {
      title: msg`Pledge instalment overdue`,
      outcome: msg`Late instalments get a reminder, and a person follows up if it stays late.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        {
          kind: 'action',
          label: msg`Find pledges with an instalment 7 days late`,
        },
        { kind: 'action', label: msg`Send the donor a reminder email` },
        {
          kind: 'action',
          label: msg`If 30 days late, create a task for the owner`,
        },
      ],
    },
    {
      title: msg`Major gift`,
      outcome: msg`A large gift reaches the development lead with a briefing ready.`,
      steps: [
        { kind: 'trigger', label: msg`Gift is created` },
        { kind: 'action', label: msg`If the amount is over $5,000` },
        { kind: 'agent', label: msg`Draft a donor briefing` },
        {
          kind: 'action',
          label: msg`Create a task for the development lead`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Giving history`,
    placedOn: 'person',
    description: msg`Shows a donor's gifts by year and campaign, with pledges and monthly giving, on one tab.`,
    preview: {
      tabLabel: 'Giving',
      title: 'Giving history',
      caption: 'Lifetime $18,650 across 31 gifts',
      columns: ['Year', 'Gifts', 'Total', 'Main campaign'],
      rows: [
        {
          id: 'year-2026',
          highlighted: true,
          cells: [
            { type: 'text', value: '2026' },
            { type: 'number', value: '13' },
            { type: 'currency', value: '$7,400' },
            { type: 'text', value: 'New Delivery Van' },
          ],
        },
        {
          id: 'year-2025',
          cells: [
            { type: 'text', value: '2025' },
            { type: 'number', value: '12' },
            { type: 'currency', value: '$6,050' },
            { type: 'text', value: 'Winter Appeal' },
          ],
        },
        {
          id: 'year-2024',
          cells: [
            { type: 'text', value: '2024' },
            { type: 'number', value: '6' },
            { type: 'currency', value: '$5,200' },
            { type: 'text', value: 'Harvest Dinner' },
          ],
        },
      ],
      footnote: 'Pledged $5,000 to the van fund: two of four instalments paid.',
    },
  },
  agents: {
    heading: msg`Agents prepare the call. *People make it*`,
    items: [
      {
        name: msg`Donor briefer`,
        job: msg`Writes a one-page briefing before a major donor call: giving history, open pledges, events attended and past notes.`,
        reads: ['person', 'gift', 'pledge', 'recurringGift', 'event', 'note'],
        writes: ['note'],
        limit: msg`Writes briefings but cannot contact donors.`,
      },
      {
        name: msg`Thank-you drafter`,
        job: msg`Drafts a personal letter for large gifts, naming the campaign the donor gave to.`,
        reads: ['person', 'gift', 'campaign'],
        writes: ['note'],
        limit: msg`Drafts letters for a person to edit and send.`,
      },
    ],
  },
  questions: [
    {
      question: msg`Can monthly donations update on their own?`,
      answer: msg`Yes. Your payment platform calls a Twenty webhook on each charge, and a workflow records the gift.`,
    },
    {
      question: msg`Can we bring our donor history with us?`,
      answer: msg`Import donors, gifts and pledges from CSV, or load them through the API.`,
    },
  ],
};
