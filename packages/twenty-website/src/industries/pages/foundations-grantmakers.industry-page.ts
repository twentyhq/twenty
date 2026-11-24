import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { NONPROFIT_INDUSTRY_PAGE } from './nonprofit.industry-page';

const applicationRow = (
  id: string,
  applicant: string,
  requested: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
  score: string,
  reviewer: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: applicant },
    requested: { type: 'currency', value: requested },
    stage: { type: 'select', ...stage },
    score: { type: 'number', value: score },
    reviewer: { type: 'person', name: reviewer, kind: 'person', tone: 'gray' },
  },
});

export const FOUNDATIONS_GRANTMAKERS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'foundations-grantmakers',
  parentSlug: 'nonprofit',
  status: 'draft',
  name: msg`Foundations and grantmakers`,
  meta: {
    title: msg`Twenty for foundations and grantmakers`,
    description: msg`Track applicants, applications, reviews, grants and payments in an open source CRM. See an example foundation workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Run your grant cycle *without the spreadsheet*`,
    body: msg`Applications, reviewer scores and payment schedules, in one place. Here is an example foundation workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ellery Valley Foundation',
    tableObjectId: 'application',
    viewName: 'Spring 2027 cycle',
    columns: [
      { id: 'name', label: 'Applicant', width: 200, isFirstColumn: true },
      { id: 'requested', label: 'Requested', width: 120, align: 'right' },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'score', label: 'Score', width: 90, align: 'right' },
      { id: 'reviewer', label: 'Lead reviewer', width: 160 },
    ],
    rows: [
      applicationRow(
        'greenway',
        'Greenway Youth Gardens',
        '$40,000',
        { value: 'In review', color: 'purple' },
        '4.3',
        'Hannah Brandt',
      ),
      applicationRow(
        'eastside',
        'Eastside Tenant Legal Aid',
        '$75,000',
        { value: 'Shortlisted', color: 'blue' },
        '4.6',
        'Kofi Mensah',
      ),
      applicationRow(
        'lantern',
        'Lantern Arts Collective',
        '$15,000',
        { value: 'Submitted', color: 'amber' },
        '—',
        'Hannah Brandt',
      ),
      applicationRow(
        'mesa',
        'Mesa Rural Health Network',
        '$120,000',
        { value: 'Awarded', color: 'green' },
        '4.8',
        'Rosa Delgado',
      ),
    ],
    record: {
      name: 'Eastside Tenant Legal Aid',
      createdAt: 'Submitted Oct 14',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'blue', value: 'Shortlisted' },
        },
        { label: 'Requested', value: { type: 'currency', value: '$75,000' } },
        { label: 'Average score', value: { type: 'text', value: '4.6 of 5' } },
        {
          label: 'Lead reviewer',
          value: { type: 'person', name: 'Kofi Mensah', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our grant cycle lives in a spreadsheet.`,
      answer: msg`Applications, grants and payments are records, linked to the applicant.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Chasing reviewers takes longer than reviewing.`,
      answer: msg`A new application assigns reviewers and sends each one a scoring form.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`The board asks why one applicant beat another.`,
      answer: msg`Every reviewer's score and comment sits on the application.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Reviewers can see every application.`,
      answer: msg`Roles and row-level rules limit reviewers to the applications they score.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'application',
      label: msg`Applications`,
      purpose: msg`One request for funding in one cycle, with its scores.`,
      fields: [
        { label: msg`Amount requested` },
        { label: msg`Cycle` },
        { label: msg`Applicant`, relatesTo: 'company' },
        { label: msg`Program`, relatesTo: 'program' },
      ],
      previewIcon: 'notes',
      previewTone: 'purple',
    },
    {
      id: 'payment',
      label: msg`Payments`,
      purpose: msg`One tranche of a grant, with its due date and condition.`,
      fields: [
        { label: msg`Amount` },
        { label: msg`Due on` },
        { label: msg`Grant`, relatesTo: 'grant' },
      ],
      previewIcon: 'coins',
      previewTone: 'teal',
    },
  ],
  workflows: [
    {
      title: msg`Application submitted`,
      outcome: msg`Every application has reviewers the day it arrives.`,
      steps: [
        { kind: 'trigger', label: msg`Application is created` },
        { kind: 'action', label: msg`Assign reviewers for the program` },
        { kind: 'action', label: msg`Send each reviewer a scoring form` },
      ],
    },
    {
      title: msg`Next tranche due`,
      outcome: msg`No payment goes out late or before its condition is met.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        { kind: 'action', label: msg`Find payments due within 14 days` },
        { kind: 'action', label: msg`Check the linked report is approved` },
        { kind: 'action', label: msg`Create a task for finance` },
      ],
    },
    NONPROFIT_INDUSTRY_PAGE.workflows.items[0],
  ],
  customScreen: {
    title: msg`Review scorecard`,
    placedOn: 'application',
    description: msg`Shows every reviewer's scores side by side, with the average the panel decides on.`,
    preview: {
      tabLabel: 'Scorecard',
      title: 'Review scorecard',
      caption: 'Three of three reviews in',
      columns: ['Reviewer', 'Fit', 'Impact', 'Capacity'],
      rows: [
        {
          id: 'mensah',
          cells: [
            { type: 'person', name: 'Kofi Mensah', kind: 'person' },
            { type: 'number', value: '5' },
            { type: 'number', value: '5' },
            { type: 'number', value: '4' },
          ],
        },
        {
          id: 'brandt',
          cells: [
            { type: 'person', name: 'Hannah Brandt', kind: 'person' },
            { type: 'number', value: '5' },
            { type: 'number', value: '4' },
            { type: 'number', value: '4' },
          ],
        },
        {
          id: 'delgado',
          highlighted: true,
          cells: [
            { type: 'person', name: 'Rosa Delgado', kind: 'person' },
            { type: 'number', value: '5' },
            { type: 'number', value: '5' },
            { type: 'number', value: '4' },
          ],
        },
      ],
      footnote: 'Average 4.6. Capacity is the weakest score across the panel.',
    },
  },
  agents: {
    heading: msg`Reviewers read the summary first. *They still decide*`,
    items: [
      {
        name: msg`Application screener`,
        job: msg`Summarizes each application against the call's criteria and flags missing documents.`,
        reads: ['application', 'company'],
        writes: ['note'],
        limit: msg`Cannot change an application's stage or score.`,
      },
    ],
  },
  questions: [
    {
      question: msg`Can applicants apply without an account?`,
      answer: msg`Keep your application form. Send each submission into Twenty through a webhook, and reviewers are assigned.`,
    },
  ],
};
