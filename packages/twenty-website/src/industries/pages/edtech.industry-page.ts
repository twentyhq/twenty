import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { EDUCATION_INDUSTRY_PAGE } from './education.industry-page';

const licenceRow = (
  id: string,
  institution: string,
  plan: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
  seats: string,
  renewsOn: string,
  accountManager: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: institution },
    plan: { type: 'select', ...plan },
    seats: { type: 'number', value: seats },
    renewsOn: { type: 'text', value: renewsOn },
    accountManager: {
      type: 'person',
      name: accountManager,
      kind: 'person',
      tone: 'gray',
    },
  },
});

export const EDTECH_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'edtech',
  parentSlug: 'education',
  status: 'draft',
  name: msg`EdTech`,
  meta: {
    title: msg`Twenty for EdTech — build your product on an open source CRM`,
    description: msg`Model institutions, licences, rollouts and cohorts, and run your product on Twenty's data model, permissions and workflows. See an example EdTech workspace.`,
  },
  hero: {
    headline: msg`Build your product *on the CRM*`,
    body: msg`Institutions, licences, rollouts and cohorts, with an API your product calls directly. Here is an example EdTech workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Brightpath Learning',
    tableObjectId: 'licence',
    viewName: 'Active licences',
    columns: [
      { id: 'name', label: 'Institution', width: 200, isFirstColumn: true },
      { id: 'plan', label: 'Plan', width: 120 },
      { id: 'seats', label: 'Seats', width: 100, align: 'right' },
      { id: 'renewsOn', label: 'Renews on', width: 130 },
      { id: 'accountManager', label: 'Account manager', width: 160 },
    ],
    rows: [
      licenceRow(
        'lakemont',
        'Lakemont College',
        { value: 'Campus', color: 'purple' },
        '2,400',
        'Jan 2027',
        'Ravi Shankar',
      ),
      licenceRow(
        'harbourside',
        'Harbourside University',
        { value: 'Faculty', color: 'blue' },
        '600',
        'Mar 2027',
        'Nora Lindqvist',
      ),
      licenceRow(
        'eastgate',
        'Eastgate Institute',
        { value: 'Pilot', color: 'amber' },
        '120',
        'Dec 2026',
        'Ravi Shankar',
      ),
      licenceRow(
        'ridgeview',
        'Ridgeview Training Centre',
        { value: 'Campus', color: 'purple' },
        '1,100',
        'Aug 2027',
        'Tomas Ruiz',
      ),
    ],
    record: {
      name: 'Lakemont College 2026',
      createdAt: 'Added Jan 15',
      fields: [
        {
          label: 'Plan',
          value: { type: 'select', color: 'purple', value: 'Campus' },
        },
        { label: 'Seats', value: { type: 'text', value: '2,400' } },
        { label: 'Renews on', value: { type: 'text', value: 'Jan 2027' } },
        {
          label: 'Account manager',
          value: { type: 'person', name: 'Ravi Shankar', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our customers are institutions, our users are students.`,
      answer: msg`Institutions hold licences, licences hold cohorts, and cohorts hold students, each as its own object.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Renewals sneak up on us.`,
      answer: msg`A weekly workflow finds licences 90 days from renewal and briefs the account manager.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We cannot tell if a rollout is used.`,
      answer: msg`Each licence shows its cohorts and how many students are active.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`We need our CRM inside our own product.`,
      answer: msg`W3villa built W3Grads with Twenty as its backbone, instead of writing that layer from scratch.`,
      answeredBy: 'proof',
    },
  ],
  addedObjects: [
    {
      id: 'licence',
      label: msg`Licences`,
      purpose: msg`What an institution bought: plan, seats and renewal date.`,
      fields: [
        { label: msg`Seats` },
        { label: msg`Renews on` },
        { label: msg`Institution`, relatesTo: 'company' },
      ],
      previewIcon: 'key',
      previewTone: 'purple',
    },
    {
      id: 'rollout',
      label: msg`Rollouts`,
      purpose: msg`Getting a licence into use at a campus or faculty, with a launch date.`,
      fields: [
        { label: msg`Launch date` },
        { label: msg`Status` },
        { label: msg`Licence`, relatesTo: 'licence' },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'orange',
    },
    {
      id: 'cohort',
      label: msg`Cohorts`,
      purpose: msg`A group of students using the product together, from one rollout.`,
      fields: [
        { label: msg`Starts on` },
        { label: msg`Rollout`, relatesTo: 'rollout' },
        { label: msg`Students`, relatesTo: 'student' },
      ],
      previewIcon: 'users',
      previewTone: 'pink',
    },
  ],
  workflows: [
    {
      title: msg`Licence renewal watch`,
      outcome: msg`Every institution hears from you 90 days before its licence renews.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        { kind: 'action', label: msg`Find licences renewing within 90 days` },
        { kind: 'agent', label: msg`Summarize usage across cohorts` },
        { kind: 'action', label: msg`Create a task for the account manager` },
      ],
    },
    {
      title: msg`Event sign-up to session`,
      outcome: msg`For example, a student scans a QR code at a campus event and gets a session link.`,
      steps: [
        { kind: 'trigger', label: msg`Sign-up page calls a webhook` },
        { kind: 'action', label: msg`Create the student in the cohort` },
        { kind: 'action', label: msg`Assign the institution's plan` },
        { kind: 'action', label: msg`Email the session link` },
      ],
    },
    EDUCATION_INDUSTRY_PAGE.workflows.items[0],
  ],
  customScreen: {
    title: msg`Rollout tracker`,
    placedOn: 'licence',
    description: msg`Shows each cohort on a licence, with how many students have started.`,
    preview: {
      tabLabel: 'Rollout',
      title: 'Rollout tracker',
      caption: 'Active students per cohort',
      columns: ['Cohort', 'Students', 'Active', 'Status'],
      rows: [
        {
          id: 'business',
          cells: [
            { type: 'text', value: 'Business, Year 3' },
            { type: 'number', value: '820' },
            { type: 'number', value: '764' },
            { type: 'select', color: 'green', value: 'Live' },
          ],
        },
        {
          id: 'engineering',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Engineering, Year 4' },
            { type: 'number', value: '940' },
            { type: 'number', value: '212' },
            { type: 'select', color: 'amber', value: 'Slow start' },
          ],
        },
        {
          id: 'nursing',
          cells: [
            { type: 'text', value: 'Nursing, Year 2' },
            { type: 'number', value: '640' },
            { type: 'number', value: '0' },
            { type: 'select', color: 'blue', value: 'Launches Feb' },
          ],
        },
      ],
      footnote:
        'Engineering is the cohort to visit before the January renewal.',
    },
  },
  questions: [
    {
      question: msg`Can we build our product on Twenty?`,
      answer: msg`W3villa did. W3Grads, its AI mock interview platform, uses Twenty for its data model, permissions, authentication and workflow engine.`,
    },
    {
      question: msg`How does our app talk to Twenty?`,
      answer: msg`Every object has a REST and GraphQL API, and webhooks tell your app when a record changes.`,
    },
  ],
  proof: { kind: 'caseStudy', caseStudySlug: 'w3villa' },
};
