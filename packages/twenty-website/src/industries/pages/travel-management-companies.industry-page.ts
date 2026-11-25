import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const accountRow = (
  id: string,
  name: string,
  annualSpend: string,
  renewal: string,
  nextReview: string,
  health: { value: string; color: 'amber' | 'green' | 'red' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name },
    annualSpend: { type: 'currency', value: annualSpend },
    renewal: { type: 'text', value: renewal },
    nextReview: { type: 'text', value: nextReview },
    health: { type: 'select', ...health },
  },
});

export const TRAVEL_MANAGEMENT_COMPANIES_INDUSTRY_PAGE: IndustrySubCategoryPage =
  {
    kind: 'subCategory',
    slug: 'travel-management-companies',
    parentSlug: 'travel-hospitality',
    status: 'draft',
    name: msg`Travel management companies`,
    meta: {
      title: msg`Twenty for travel management companies`,
      description: msg`Track corporate accounts, travel policies, service agreements and quarterly reviews in an open source CRM. See an example TMC workspace built on Twenty.`,
    },
    hero: {
      headline: msg`Every corporate account, *policy and review in one place*`,
      body: msg`Travel policies, service agreements, renewals and quarterly reviews on each corporate account. Here is an example travel management workspace built on Twenty.`,
    },
    preview: {
      workspaceName: 'Halyard Business Travel',
      tableObjectId: 'company',
      viewName: 'Corporate accounts',
      columns: [
        {
          id: 'name',
          label: 'Corporate account',
          width: 200,
          isFirstColumn: true,
        },
        {
          id: 'annualSpend',
          label: 'Annual spend',
          width: 140,
          align: 'right',
        },
        { id: 'renewal', label: 'Agreement renews', width: 150 },
        { id: 'nextReview', label: 'Next review', width: 130 },
        { id: 'health', label: 'Health', width: 120 },
      ],
      rows: [
        accountRow(
          'quarrystone',
          'Quarrystone Engineering',
          '$2,140,000',
          'Jun 30, 2027',
          'Jan 14, 2027',
          { value: 'Healthy', color: 'green' },
        ),
        accountRow(
          'elmhurst',
          'Elmhurst Pharma',
          '$3,880,000',
          'Feb 28, 2027',
          'Dec 9, 2026',
          { value: 'At risk', color: 'red' },
        ),
        accountRow(
          'tarnside',
          'Tarnside Energy',
          '$960,000',
          'Sep 30, 2027',
          'Jan 21, 2027',
          { value: 'Healthy', color: 'green' },
        ),
        accountRow(
          'vellum',
          'Vellum Media Group',
          '$1,270,000',
          'Apr 30, 2027',
          'Dec 16, 2026',
          { value: 'Watch', color: 'amber' },
        ),
      ],
      record: {
        name: 'Elmhurst Pharma',
        createdAt: 'Added Mar 2',
        fields: [
          {
            label: 'Health',
            value: { type: 'select', color: 'red', value: 'At risk' },
          },
          {
            label: 'Annual spend',
            value: { type: 'currency', value: '$3,880,000' },
          },
          {
            label: 'Agreement renews',
            value: { type: 'text', value: 'Feb 28, 2027' },
          },
          {
            label: 'Next review',
            value: { type: 'text', value: 'Dec 9, 2026' },
          },
          {
            label: 'Account manager',
            value: { type: 'person', name: 'Olivia Strand', kind: 'person' },
          },
        ],
      },
    },
    addedObjects: [
      {
        id: 'travelPolicy',
        label: msg`Travel policies`,
        purpose: msg`A corporate account's rules on cabin class, hotel caps and approvals.`,
        fields: [
          { label: msg`Cabin class by flight length` },
          { label: msg`Hotel nightly cap` },
          { label: msg`Approval required above` },
          { label: msg`Corporate account`, relatesTo: 'company' },
        ],
        previewIcon: 'shieldCheck',
        previewTone: 'teal',
      },
      {
        id: 'serviceAgreement',
        label: msg`Service agreements`,
        purpose: msg`The contract with a corporate account: fees, service levels and renewal date.`,
        fields: [
          { label: msg`Transaction fee` },
          { label: msg`Service levels` },
          { label: msg`Renews on` },
          { label: msg`Corporate account`, relatesTo: 'company' },
        ],
        previewIcon: 'book',
        previewTone: 'orange',
      },
      {
        id: 'businessReview',
        label: msg`Quarterly business reviews`,
        purpose: msg`One review meeting with an account, with spend, savings and agreed actions.`,
        fields: [
          { label: msg`Quarter` },
          { label: msg`Spend in quarter` },
          { label: msg`Policy compliance` },
          { label: msg`Corporate account`, relatesTo: 'company' },
        ],
        previewIcon: 'targetArrow',
        previewTone: 'pink',
      },
    ],
    workflows: [
      {
        title: msg`Review coming up`,
        outcome: msg`Every quarterly review starts from a drafted pack, not a blank slide.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find reviews scheduled in 14 days` },
          {
            kind: 'agent',
            label: msg`Review preparer drafts the review pack`,
          },
          {
            kind: 'action',
            label: msg`Create a prep task for the account manager`,
          },
        ],
      },
      {
        title: msg`Agreement renewal`,
        outcome: msg`Renewal talks open 90 days before an agreement ends.`,
        steps: [
          { kind: 'trigger', label: msg`Every Monday at 08:00` },
          {
            kind: 'action',
            label: msg`Find service agreements renewing in 90 days`,
          },
          { kind: 'action', label: msg`Email the account manager` },
          { kind: 'action', label: msg`Create a renewal task` },
        ],
      },
      {
        title: msg`Policy changed`,
        outcome: msg`Travel bookers learn about a policy change the day it is made.`,
        steps: [
          { kind: 'trigger', label: msg`A travel policy is updated` },
          {
            kind: 'action',
            label: msg`Find the travel bookers at the account`,
          },
          { kind: 'action', label: msg`Email each booker the new rules` },
        ],
      },
    ],
    customScreen: {
      title: msg`Account review`,
      placedOn: 'company',
      description: msg`Puts the account's policy, agreement terms and last reviews side by side before every meeting.`,
      preview: {
        tabLabel: 'Review',
        title: 'Account review',
        caption: 'Last three quarters',
        columns: ['Quarter', 'Spend', 'Policy compliance', 'Actions open'],
        rows: [
          {
            id: 'q1',
            cells: [
              { type: 'text', value: 'Q1 2026' },
              { type: 'currency', value: '$1,020,000' },
              { type: 'select', color: 'green', value: '91%' },
              { type: 'number', value: '0' },
            ],
          },
          {
            id: 'q2',
            cells: [
              { type: 'text', value: 'Q2 2026' },
              { type: 'currency', value: '$960,000' },
              { type: 'select', color: 'amber', value: '84%' },
              { type: 'number', value: '1' },
            ],
          },
          {
            id: 'q3',
            highlighted: true,
            cells: [
              { type: 'text', value: 'Q3 2026' },
              { type: 'currency', value: '$910,000' },
              { type: 'select', color: 'red', value: '76%' },
              { type: 'number', value: '3' },
            ],
          },
        ],
        footnote: 'Compliance is falling ahead of the February renewal.',
      },
    },
    agents: {
      heading: msg`An agent drafts the review. *Account managers run it*`,
      items: [
        {
          name: msg`Review preparer`,
          job: msg`Drafts the quarterly review pack from bookings, policy and the last review's actions.`,
          reads: [
            'company',
            'booking',
            'travelPolicy',
            'serviceAgreement',
            'businessReview',
          ],
          writes: ['note', 'task'],
          limit: msg`Drafts only. Cannot change policies or agreements.`,
        },
      ],
    },
    questions: [
      {
        question: msg`Our booking data sits in the online booking tool.`,
        answer: msg`Keep it there. Bookings reach Twenty through the API or a CSV import, so each review uses real spend.`,
      },
    ],
  };
