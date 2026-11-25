import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const policyRow = (
  id: string,
  policy: string,
  client: string,
  carrier: string,
  premium: string,
  expires: { value: string; color: 'amber' | 'green' | 'red' },
  accountExecutive: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: policy, shortLabel: policy[0], tone: 'teal' },
    client: { type: 'entity', name: client },
    carrier: { type: 'text', value: carrier },
    premium: { type: 'currency', value: premium },
    expires: { type: 'select', ...expires },
    accountExecutive: {
      type: 'person',
      name: accountExecutive,
      kind: 'person',
      tone: 'gray',
    },
  },
});

export const INSURANCE_BROKERS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'insurance-brokers',
  parentSlug: 'financial-services',
  status: 'draft',
  name: msg`Insurance brokers`,
  meta: {
    title: msg`Twenty for insurance brokers and agencies`,
    description: msg`Track policies, carriers, renewals and claims for every client in an open source CRM. See an example insurance brokerage workspace built on Twenty.`,
  },
  hero: {
    headline: msg`No renewal lapses *because nobody looked*`,
    body: msg`Policies, carriers, renewals and claims linked to each client, with every renewal flagged 60 days out. Here is an example insurance brokerage workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Brightwater Risk Partners',
    tableObjectId: 'policy',
    viewName: 'Expiring in 90 days',
    columns: [
      { id: 'name', label: 'Policy', width: 180, isFirstColumn: true },
      { id: 'client', label: 'Client', width: 170 },
      { id: 'carrier', label: 'Carrier', width: 150 },
      { id: 'premium', label: 'Premium', width: 120, align: 'right' },
      { id: 'expires', label: 'Expires', width: 120 },
      { id: 'accountExecutive', label: 'Account exec', width: 160 },
    ],
    rows: [
      policyRow(
        'harlow-cyber',
        'Cyber liability',
        'Harlow Precision',
        'Lowmoor Assurance',
        '$18,400',
        { value: 'In 41 days', color: 'amber' },
        'Jonah Whitfield',
      ),
      policyRow(
        'ostrander-fleet',
        'Commercial auto',
        'Ostrander Logistics',
        'Tallis Mutual',
        '$64,900',
        { value: 'In 12 days', color: 'red' },
        'Amara Celik',
      ),
      policyRow(
        'pinecrest-professional',
        'Professional liability',
        'Pinecrest Dental Group',
        'Granitefold Insurance',
        '$9,750',
        { value: 'In 58 days', color: 'amber' },
        'Owen Prescott',
      ),
      policyRow(
        'vela-property',
        'Property',
        'Vela Marine Supply',
        'Tallis Mutual',
        '$27,300',
        { value: 'In 83 days', color: 'green' },
        'Jonah Whitfield',
      ),
      policyRow(
        'quarry-liability',
        'General liability',
        'Quarry Lane Bakery',
        'Granitefold Insurance',
        '$4,120',
        { value: 'In 77 days', color: 'green' },
        'Amara Celik',
      ),
    ],
    record: {
      name: 'Harlow Precision',
      createdAt: 'Added Oct 2',
      fields: [
        {
          label: 'Total premium',
          value: { type: 'currency', value: '$71,650' },
        },
        { label: 'Active policies', value: { type: 'text', value: '4' } },
        {
          label: 'Next renewal',
          value: { type: 'select', color: 'amber', value: 'In 41 days' },
        },
        {
          label: 'Account exec',
          value: { type: 'person', name: 'Jonah Whitfield', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Renewals live in a spreadsheet that someone forgets to open.`,
      answer: msg`A daily workflow finds policies expiring in 60 days and opens the renewal for the account executive.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Our agency system holds the policy, not the relationship.`,
      answer: msg`Clients, policies, carriers and claims are linked records, with every email and meeting attached.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Account executives hear about a claim days after it is filed.`,
      answer: msg`A new claim creates a task for the claims handler and emails the account executive.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Every producer can see every client's premiums.`,
      answer: msg`Roles and row-level permissions limit each producer to their own clients.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'policy',
      label: msg`Policies`,
      purpose: msg`One line of cover for a client, placed with a carrier.`,
      fields: [
        { label: msg`Premium` },
        { label: msg`Expiry date` },
        { label: msg`Client`, relatesTo: 'company' },
        { label: msg`Carrier`, relatesTo: 'carrier' },
      ],
      previewIcon: 'shieldCheck',
      previewTone: 'teal',
    },
    {
      id: 'carrier',
      label: msg`Carriers`,
      purpose: msg`An insurer you place business with, and your contacts there.`,
      fields: [
        { label: msg`Lines written` },
        { label: msg`Underwriter`, relatesTo: 'person' },
        { label: msg`Policies`, relatesTo: 'policy' },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'blue',
    },
    {
      id: 'renewal',
      label: msg`Renewals`,
      purpose: msg`One policy coming up for renewal, with a stage and quotes received.`,
      fields: [
        { label: msg`Stage` },
        { label: msg`Due date` },
        { label: msg`Policy`, relatesTo: 'policy' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'amber',
    },
    {
      id: 'claim',
      label: msg`Claims`,
      purpose: msg`A loss reported against a policy, followed until it is settled.`,
      fields: [
        { label: msg`Loss date` },
        { label: msg`Status` },
        { label: msg`Policy`, relatesTo: 'policy' },
      ],
      previewIcon: 'fileText',
      previewTone: 'red',
    },
  ],
  omittedObjectIds: [
    'household',
    'account',
    'mandate',
    'review',
    'referralSource',
  ],
  modelNotes: [
    {
      title: msg`The client is a company`,
      body: msg`Every policy, renewal and claim links to the client, so an account executive sees the whole relationship.`,
    },
    {
      title: msg`A renewal is its own record`,
      body: msg`Each term gets a renewal with its stage and target premium, so last year's quotes stay on file.`,
    },
    {
      title: msg`Carriers are records too`,
      body: msg`Policies point to their carrier, so you can see what you place with each market.`,
    },
  ],
  workflows: [
    {
      title: msg`Renewal 60 days out`,
      outcome: msg`Every renewal is remarketed with time to spare.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find policies expiring in 60 days` },
        { kind: 'action', label: msg`Create the renewal record` },
        { kind: 'agent', label: msg`Draft the remarketing brief` },
        {
          kind: 'action',
          label: msg`Create a task for the account executive`,
        },
      ],
    },
    {
      title: msg`Claim opened`,
      outcome: msg`The account executive knows about a claim the day it is filed.`,
      steps: [
        { kind: 'trigger', label: msg`Claim is created` },
        { kind: 'action', label: msg`Create a follow-up task for claims` },
        { kind: 'action', label: msg`Email the account executive` },
      ],
    },
    {
      title: msg`Certificate request`,
      outcome: msg`Certificate requests reach the right person with the policy attached.`,
      steps: [
        { kind: 'trigger', label: msg`Website form sends a webhook` },
        { kind: 'action', label: msg`Find the client's active policies` },
        { kind: 'action', label: msg`Create a certificate task` },
        { kind: 'action', label: msg`Email the client a confirmation` },
      ],
    },
  ],
  agents: {
    heading: msg`Agents that prepare the renewal. *Brokers negotiate it*`,
    items: [
      {
        name: msg`Renewal analyst`,
        job: msg`Reads the policy, its claims and past notes, then writes the remarketing brief for the account executive.`,
        reads: ['policy', 'claim', 'renewal', 'carrier', 'company'],
        writes: ['note'],
        limit: msg`Writes notes only. Cannot change premiums or a renewal's stage.`,
      },
    ],
  },
  customScreen: {
    title: msg`Coverage summary`,
    placedOn: 'company',
    description: msg`Every policy the client holds, with its carrier, limit and expiry, on one tab.`,
    preview: {
      tabLabel: 'Coverage',
      title: 'Coverage summary',
      caption: '4 active policies',
      columns: ['Coverage', 'Carrier', 'Limit', 'Expires'],
      rows: [
        {
          id: 'general',
          cells: [
            { type: 'text', value: 'General liability' },
            { type: 'text', value: 'Granitefold Insurance' },
            { type: 'currency', value: '$2,000,000' },
            { type: 'text', value: 'Jun 30, 2027' },
          ],
        },
        {
          id: 'property',
          cells: [
            { type: 'text', value: 'Property' },
            { type: 'text', value: 'Tallis Mutual' },
            { type: 'currency', value: '$5,500,000' },
            { type: 'text', value: 'Apr 1, 2027' },
          ],
        },
        {
          id: 'workers',
          cells: [
            { type: 'text', value: "Workers' compensation" },
            { type: 'text', value: 'Tallis Mutual' },
            { type: 'currency', value: '$1,000,000' },
            { type: 'text', value: 'Sep 15, 2027' },
          ],
        },
        {
          id: 'cyber',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Cyber liability' },
            { type: 'text', value: 'Lowmoor Assurance' },
            { type: 'currency', value: '$1,000,000' },
            { type: 'text', value: 'Jan 5, 2027' },
          ],
        },
      ],
      footnote: 'Cyber renews in 41 days. The remarketing brief is drafted.',
    },
  },
  access: {
    heading: msg`Producers keep their book. *Claims sees every policy*`,
    roles: [
      { id: 'accountExecutive', label: msg`Account executive` },
      { id: 'claimsHandler', label: msg`Claims handler` },
      { id: 'principal', label: msg`Principal` },
    ],
    rules: [
      {
        objectId: 'company',
        accessByRoleId: {
          accountExecutive: msg`Own clients only`,
          claimsHandler: msg`See all, read-only`,
          principal: msg`See and edit all`,
        },
      },
      {
        objectId: 'policy',
        accessByRoleId: {
          accountExecutive: msg`On own clients`,
          claimsHandler: msg`See all, premiums hidden`,
          principal: msg`See and edit all`,
        },
      },
      {
        objectId: 'claim',
        accessByRoleId: {
          accountExecutive: msg`On own clients, read-only`,
          claimsHandler: msg`See and edit all`,
          principal: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'renewal' },
      { salesforceObject: 'Policy (custom)', objectId: 'policy' },
      { salesforceObject: 'Claim (custom)', objectId: 'claim' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  discovery: [
    {
      question: msg`How many policies come up for renewal each month?`,
      shapes: msg`Sets the renewal views and how far ahead the workflow runs.`,
    },
    {
      question: msg`Which carriers do you place most business with?`,
      shapes: msg`Decides the carrier records and who owns each relationship.`,
    },
    {
      question: msg`What does your agency management system hold?`,
      shapes: msg`Decides what syncs through the API and what stays there.`,
    },
    {
      question: msg`Who handles a claim once it is reported?`,
      shapes: msg`Sets the claims handler role and its access.`,
    },
    {
      question: msg`How do clients ask for certificates today?`,
      shapes: msg`Each channel becomes a form, a webhook or an email workflow.`,
    },
  ],
  questions: [
    {
      question: msg`Does it replace our agency management system?`,
      answer: msg`No. Keep it for policy administration and bring policies into Twenty through the API or a CSV import.`,
    },
    {
      question: msg`Can clients request certificates without emailing us?`,
      answer: msg`Your website form posts to a workflow webhook, which creates the task and confirms by email.`,
    },
  ],
};
