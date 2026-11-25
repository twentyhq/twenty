import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const financialPlanRow = (
  id: string,
  household: string,
  status: { value: string; color: 'amber' | 'green' | 'red' },
  goalsOnTrack: string,
  nextReview: string,
  advisor: string,
): RowDef => ({
  id,
  cells: {
    name: {
      type: 'text',
      value: household,
      shortLabel: household[0],
      tone: 'purple',
    },
    status: { type: 'select', ...status },
    goalsOnTrack: { type: 'text', value: goalsOnTrack },
    nextReview: { type: 'text', value: nextReview },
    advisor: { type: 'person', name: advisor, kind: 'person', tone: 'gray' },
  },
});

export const WEALTH_MANAGEMENT_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'wealth-management',
  parentSlug: 'financial-services',
  status: 'draft',
  name: msg`Wealth management`,
  meta: {
    title: msg`Twenty for wealth managers and independent advisors`,
    description: msg`Keep financial plans, goals and beneficiaries on the household, with reviews and life events on time. See an example advisory firm workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every household, every review, *nothing missed*`,
    body: msg`Financial plans, goals and beneficiaries on the household, with reviews and life events that come up on time. Here is an example independent advisory firm workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Fernhollow Advisors',
    tableObjectId: 'financialPlan',
    viewName: 'Plans by review date',
    columns: [
      { id: 'name', label: 'Plan', width: 200, isFirstColumn: true },
      { id: 'status', label: 'Status', width: 130 },
      { id: 'goalsOnTrack', label: 'Goals on track', width: 130 },
      { id: 'nextReview', label: 'Next review', width: 140 },
      { id: 'advisor', label: 'Advisor', width: 160 },
    ],
    rows: [
      financialPlanRow(
        'abernathy',
        'Abernathy retirement plan',
        { value: 'Needs review', color: 'amber' },
        '3 of 4',
        'In 9 days',
        'Margaret Ellison',
      ),
      financialPlanRow(
        'okafor',
        'Okafor family plan',
        { value: 'On track', color: 'green' },
        '5 of 5',
        'Jan 27, 2027',
        'Tomas Vega',
      ),
      financialPlanRow(
        'lindgren',
        'Lindgren succession plan',
        { value: 'Off track', color: 'red' },
        '1 of 3',
        'In 18 days',
        'Priya Raman',
      ),
      financialPlanRow(
        'sato',
        'Sato household plan',
        { value: 'On track', color: 'green' },
        '2 of 2',
        'Mar 3, 2027',
        'Margaret Ellison',
      ),
      financialPlanRow(
        'prieto',
        'Prieto trust plan',
        { value: 'On track', color: 'green' },
        '4 of 4',
        'Apr 15, 2027',
        'Tomas Vega',
      ),
    ],
    record: {
      name: 'Abernathy household',
      createdAt: 'Added Feb 6',
      fields: [
        {
          label: 'AUM',
          value: { type: 'currency', value: '$3,240,000' },
        },
        { label: 'Next review', value: { type: 'text', value: 'In 9 days' } },
        {
          label: 'Plan status',
          value: { type: 'select', color: 'amber', value: 'Needs review' },
        },
        {
          label: 'Advisor',
          value: { type: 'person', name: 'Margaret Ellison', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'financialPlan',
      label: msg`Financial plans`,
      purpose: msg`The household's current plan, with the date it was last reviewed.`,
      fields: [
        { label: msg`Plan type` },
        { label: msg`Last reviewed` },
        { label: msg`Household`, relatesTo: 'household' },
      ],
      previewIcon: 'fileText',
      previewTone: 'purple',
    },
    {
      id: 'goal',
      label: msg`Goals`,
      purpose: msg`Something the household is saving for, with a target and a date.`,
      fields: [
        { label: msg`Target amount` },
        { label: msg`Target date` },
        { label: msg`Funded so far` },
        { label: msg`Financial plan`, relatesTo: 'financialPlan' },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'green',
    },
    {
      id: 'beneficiary',
      label: msg`Beneficiaries`,
      purpose: msg`Who inherits an account, and what share they receive.`,
      fields: [
        { label: msg`Share` },
        { label: msg`Person`, relatesTo: 'person' },
        { label: msg`Account`, relatesTo: 'account' },
      ],
      previewIcon: 'user',
      previewTone: 'pink',
    },
  ],
  workflows: [
    {
      title: msg`Birthday and life-event outreach`,
      outcome: msg`Every milestone in a household gets a personal note from the advisor.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        {
          kind: 'action',
          label: msg`Find members with a birthday or life event this week`,
        },
        { kind: 'agent', label: msg`Draft a personal note for each` },
        { kind: 'action', label: msg`Create an outreach task for the advisor` },
      ],
    },
    {
      title: msg`Plan review due`,
      outcome: msg`No plan goes more than a year without a fresh look at its goals.`,
      steps: [
        { kind: 'trigger', label: msg`First day of each month` },
        {
          kind: 'action',
          label: msg`Find plans last reviewed over 11 months ago`,
        },
        {
          kind: 'agent',
          label: msg`Summarize goal progress since last review`,
        },
        { kind: 'action', label: msg`Create a plan review task` },
      ],
    },
    {
      title: msg`New account opened at the custodian`,
      outcome: msg`Every new account starts onboarding the day it opens.`,
      steps: [
        { kind: 'trigger', label: msg`Custodian sends a webhook` },
        { kind: 'action', label: msg`Create the account on the household` },
        { kind: 'action', label: msg`Create onboarding tasks for operations` },
        { kind: 'action', label: msg`Email the advisor` },
      ],
    },
  ],
  customScreen: {
    title: msg`Goals progress`,
    placedOn: 'household',
    description: msg`Each goal on the household's plan, with its target, how much is funded and whether it is on track.`,
    preview: {
      tabLabel: 'Goals',
      title: 'Goals progress',
      caption: '3 of 4 goals on track',
      columns: ['Goal', 'Target date', 'Target', 'Funded', 'Status'],
      rows: [
        {
          id: 'retirement',
          cells: [
            { type: 'text', value: 'Retire at 62' },
            { type: 'text', value: 'Jun 2031' },
            { type: 'currency', value: '$2,800,000' },
            { type: 'text', value: '81%' },
            { type: 'select', color: 'green', value: 'On track' },
          ],
        },
        {
          id: 'college',
          cells: [
            { type: 'text', value: "Nora's college fund" },
            { type: 'text', value: 'Sep 2030' },
            { type: 'currency', value: '$240,000' },
            { type: 'text', value: '74%' },
            { type: 'select', color: 'green', value: 'On track' },
          ],
        },
        {
          id: 'cabin',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Lake cabin' },
            { type: 'text', value: 'May 2028' },
            { type: 'currency', value: '$450,000' },
            { type: 'text', value: '38%' },
            { type: 'select', color: 'amber', value: 'Behind' },
          ],
        },
        {
          id: 'giving',
          cells: [
            { type: 'text', value: 'Donor-advised fund' },
            { type: 'text', value: 'Dec 2027' },
            { type: 'currency', value: '$100,000' },
            { type: 'text', value: '90%' },
            { type: 'select', color: 'green', value: 'On track' },
          ],
        },
      ],
      footnote: 'The lake cabin goal is behind, so it leads the review agenda.',
    },
  },
  questions: [
    {
      question: msg`Does it replace our planning software?`,
      answer: msg`No. Keep your planning tool and bring plan and goal summaries onto the household through the API or a CSV import.`,
    },
    {
      question: msg`Can we see beneficiaries across all of a household's accounts?`,
      answer: msg`Yes. Each beneficiary links a person to an account with their share, so the household shows every designation.`,
    },
  ],
};
