import { msg } from '@lingui/core/macro';
import { IconBuildingBank } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const householdRow = (
  id: string,
  name: string,
  assetsUnderManagement: string,
  nextReview: string,
  knowYourCustomer: { value: string; color: 'amber' | 'green' | 'red' },
  advisor: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    assetsUnderManagement: { type: 'currency', value: assetsUnderManagement },
    nextReview: { type: 'text', value: nextReview },
    knowYourCustomer: { type: 'select', ...knowYourCustomer },
    advisor: { type: 'person', name: advisor, kind: 'person', tone: 'gray' },
  },
});

export const FINANCIAL_SERVICES_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'financial-services',
  status: 'draft',
  name: msg`Financial services`,
  menu: {
    description: msg`Households, mandates and deals`,
    icon: IconBuildingBank,
  },
  meta: {
    title: msg`Twenty for financial services — a CRM built around households and mandates`,
    description: msg`Model households, accounts, mandates and reviews in an open source CRM, with roles and audit logs. See an example advisory firm workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Households, mandates and compliance, *modelled the way your firm works*`,
    body: msg`Households, accounts at the custodian and annual reviews, not contacts and deals. Here is an example advisory firm workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ashgrove Wealth',
    tableObjectId: 'household',
    viewName: 'My households',
    columns: [
      { id: 'name', label: 'Household', width: 190, isFirstColumn: true },
      {
        id: 'assetsUnderManagement',
        label: 'AUM',
        width: 130,
        align: 'right',
      },
      { id: 'nextReview', label: 'Next review', width: 140 },
      { id: 'knowYourCustomer', label: 'KYC', width: 120 },
      { id: 'advisor', label: 'Advisor', width: 160 },
    ],
    rows: [
      householdRow(
        'whitlock',
        'Whitlock household',
        '$4,820,000',
        'In 12 days',
        { value: 'Expiring', color: 'amber' },
        'Daniel Moreau',
      ),
      householdRow(
        'osei',
        'Osei household',
        '$2,150,000',
        'Feb 4, 2027',
        { value: 'Current', color: 'green' },
        'Hannah Lindqvist',
      ),
      householdRow(
        'castellano',
        'Castellano family',
        '$7,390,000',
        'Jan 19, 2027',
        { value: 'Current', color: 'green' },
        'Daniel Moreau',
      ),
      householdRow(
        'brandt',
        'Brandt household',
        '$960,000',
        'In 26 days',
        { value: 'Expired', color: 'red' },
        'Ruth Achebe',
      ),
      householdRow(
        'nakamura',
        'Nakamura trust',
        '$3,410,000',
        'Mar 11, 2027',
        { value: 'Current', color: 'green' },
        'Hannah Lindqvist',
      ),
      householdRow(
        'delacroix',
        'Delacroix household',
        '$1,275,000',
        'Apr 2, 2027',
        { value: 'Current', color: 'green' },
        'Ruth Achebe',
      ),
    ],
    record: {
      name: 'Whitlock household',
      createdAt: 'Added Mar 14',
      fields: [
        {
          label: 'AUM',
          value: { type: 'currency', value: '$4,820,000' },
        },
        { label: 'Next review', value: { type: 'text', value: 'In 12 days' } },
        {
          label: 'KYC',
          value: { type: 'select', color: 'amber', value: 'Expiring' },
        },
        {
          label: 'Advisor',
          value: { type: 'person', name: 'Daniel Moreau', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Every change to Financial Services Cloud is a consultant ticket.`,
      answer: msg`Objects, fields and relations are edited in settings, by your own operations team.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Our advisors log meetings in Outlook, not the CRM.`,
      answer: msg`Email and calendar sync attaches every meeting to the people in the household.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Compliance asks who saw what, and we can't answer.`,
      answer: msg`Roles and row-level permissions decide who sees a household. Audit logs on the Organization plan record the activity.`,
      answeredBy: 'access',
    },
    {
      complaint: msg`We pay enterprise prices for 40 seats.`,
      answer: msg`Move households, accounts and mandates across with the data loader and a CSV import.`,
      answeredBy: 'switching',
    },
  ],
  dataModel: {
    heading: msg`Model the firm *the way advisors talk about it*`,
    objects: [
      {
        id: 'household',
        label: msg`Households`,
        purpose: msg`The family you advise. Several people and accounts, one relationship.`,
        fields: [
          { label: msg`Assets under management` },
          { label: msg`Next review date` },
          { label: msg`Members`, relatesTo: 'person' },
        ],
        previewIcon: 'home',
        previewTone: 'blue',
      },
      {
        id: 'account',
        label: msg`Accounts`,
        purpose: msg`Holdings at a custodian, owned by a household.`,
        fields: [
          { label: msg`Custodian` },
          { label: msg`Market value` },
          { label: msg`Household`, relatesTo: 'household' },
        ],
        previewIcon: 'coins',
        previewTone: 'green',
      },
      {
        id: 'mandate',
        label: msg`Mandates`,
        purpose: msg`What the household has asked you to do, with a stage and a fee.`,
        fields: [
          { label: msg`Strategy` },
          { label: msg`Stage` },
          { label: msg`Household`, relatesTo: 'household' },
        ],
        previewIcon: 'briefcase',
        previewTone: 'purple',
      },
      {
        id: 'review',
        label: msg`Reviews`,
        purpose: msg`One meeting with a household, with an agenda and decisions.`,
        fields: [
          { label: msg`Scheduled for` },
          { label: msg`Outcome` },
          { label: msg`Household`, relatesTo: 'household' },
        ],
        previewIcon: 'calendarEvent',
        previewTone: 'amber',
      },
      {
        id: 'referralSource',
        label: msg`Referral sources`,
        purpose: msg`The accountant, lawyer or client who sends you new households.`,
        fields: [
          { label: msg`Type` },
          { label: msg`Households referred`, relatesTo: 'household' },
          { label: msg`Contact`, relatesTo: 'person' },
        ],
        previewIcon: 'users',
        previewTone: 'teal',
      },
    ],
    notes: [
      {
        title: msg`A household is the client`,
        body: msg`It links several people and accounts, so a spouse or a trust never becomes a duplicate.`,
      },
      {
        title: msg`Reviews hang off the household`,
        body: msg`Every past agenda and decision stays on one record, ready for the next meeting.`,
      },
      {
        title: msg`Referrals are tracked, not remembered`,
        body: msg`Each household points to its source, so you know which accountants send business.`,
      },
    ],
  },
  workflows: {
    heading: msg`The routine runs itself. *Advisors keep the relationship*`,
    items: [
      {
        title: msg`Annual review due`,
        outcome: msg`No household goes a year without a review.`,
        steps: [
          { kind: 'trigger', label: msg`Every Monday at 07:00` },
          { kind: 'action', label: msg`Find households due within 30 days` },
          { kind: 'agent', label: msg`Draft the review agenda` },
          { kind: 'action', label: msg`Create a review task for the advisor` },
        ],
      },
      {
        title: msg`Know-your-customer refresh`,
        outcome: msg`No mandate moves forward on an expired document.`,
        steps: [
          { kind: 'trigger', label: msg`KYC document expiry date is reached` },
          { kind: 'action', label: msg`Create a refresh task for the advisor` },
          { kind: 'action', label: msg`Lock the mandate stage` },
        ],
      },
      {
        title: msg`New referral`,
        outcome: msg`Every referral has an advisor the day it arrives.`,
        steps: [
          { kind: 'trigger', label: msg`Website form sends a webhook` },
          { kind: 'action', label: msg`Create the person and household` },
          { kind: 'action', label: msg`Assign an advisor` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that prepare the meeting. *Advisors run it*`,
    items: [
      {
        name: msg`Review prep`,
        job: msg`Reads the household's notes, emails and holdings, then drafts the review brief.`,
        reads: ['household', 'account', 'review', 'person'],
        writes: ['note'],
        limit: msg`Reads financial fields but cannot edit them.`,
      },
    ],
  },
  customScreen: {
    title: msg`Household overview`,
    placedOn: 'household',
    description: msg`Members, accounts, assets under management and the next review, on one tab.`,
    preview: {
      tabLabel: 'Overview',
      title: 'Household overview',
      caption: 'Next review in 12 days',
      columns: ['Account', 'Owner', 'Custodian', 'Value'],
      rows: [
        {
          id: 'joint',
          cells: [
            { type: 'text', value: 'Joint brokerage' },
            { type: 'person', name: 'Paul & Irene Whitlock', kind: 'person' },
            { type: 'text', value: 'Northbank Custody' },
            { type: 'currency', value: '$2,640,000' },
          ],
        },
        {
          id: 'retirement',
          cells: [
            { type: 'text', value: 'Retirement account' },
            { type: 'person', name: 'Irene Whitlock', kind: 'person' },
            { type: 'text', value: 'Northbank Custody' },
            { type: 'currency', value: '$1,310,000' },
          ],
        },
        {
          id: 'trust',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Education trust' },
            { type: 'person', name: 'Leo Whitlock', kind: 'person' },
            { type: 'text', value: 'Calder Trust Co.' },
            { type: 'currency', value: '$870,000' },
          ],
        },
      ],
      footnote: 'The education trust KYC expires before the review.',
    },
  },
  access: {
    heading: msg`Advisors keep their book. *Compliance sees everything*`,
    roles: [
      { id: 'advisor', label: msg`Advisor` },
      { id: 'compliance', label: msg`Compliance` },
      { id: 'partner', label: msg`Partner` },
    ],
    rules: [
      {
        objectId: 'household',
        accessByRoleId: {
          advisor: msg`Own only, AUM hidden`,
          compliance: msg`See all, read-only, AUM hidden`,
          partner: msg`See and edit all, with AUM`,
        },
      },
      {
        objectId: 'account',
        accessByRoleId: {
          advisor: msg`On own households`,
          compliance: msg`See all, read-only`,
          partner: msg`See and edit all`,
        },
      },
      {
        objectId: 'mandate',
        accessByRoleId: {
          advisor: msg`On own households`,
          compliance: msg`See all, read-only`,
          partner: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Financial Services Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'household' },
      { salesforceObject: 'Person Account', objectId: 'person' },
      { salesforceObject: 'Financial Account', objectId: 'account' },
      { salesforceObject: 'Opportunity', objectId: 'mandate' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Is it compliant?`,
      answer: msg`SSO and audit logs come with the Organization plan. For data residency, host it yourself or use our cloud.`,
    },
    {
      question: msg`Can it talk to our custodian and planning tools?`,
      answer: msg`Through the REST and GraphQL API, webhooks and workflow HTTP requests. There are no packaged connectors today.`,
    },
    {
      question: msg`Our advisors will not leave Outlook.`,
      answer: msg`They do not have to. Email and calendar sync brings their meetings onto the household.`,
    },
    {
      question: msg`Who owns our client data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`How many households does each advisor look after?`,
      shapes: msg`Sets the views and the review cadence.`,
    },
    {
      question: msg`Which custodians hold your clients' accounts?`,
      shapes: msg`Each custodian becomes an import or an API sync.`,
    },
    {
      question: msg`Who audits access, and how often?`,
      shapes: msg`Sets the roles, row-level rules and audit log review.`,
    },
    {
      question: msg`What triggers a review today?`,
      shapes: msg`Usually the first workflow to build.`,
    },
    {
      question: msg`What do you pay Salesforce and your consultant per year?`,
      shapes: msg`Frames the switching case.`,
    },
  ],
};
