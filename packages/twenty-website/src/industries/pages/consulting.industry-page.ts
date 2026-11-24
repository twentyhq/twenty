import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { PROFESSIONAL_SERVICES_INDUSTRY_PAGE } from './professional-services.industry-page';

const engagementRow = (
  id: string,
  name: string,
  client: string,
  workstreams: string,
  nextDeliverable: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    client: { type: 'entity', name: client },
    workstreams: { type: 'number', value: workstreams },
    nextDeliverable: { type: 'text', value: nextDeliverable },
    stage: { type: 'select', ...stage },
  },
});

export const CONSULTING_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'consulting',
  parentSlug: 'professional-services',
  status: 'draft',
  name: msg`Consulting`,
  meta: {
    title: msg`Twenty for consulting firms`,
    description: msg`Track proposals, engagements, workstreams and deliverables in an open source CRM. See an example consulting workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Win the proposal, *the project sets itself up*`,
    body: msg`Proposals, workstreams, deliverables and the team behind them, on one record. Here is an example consulting workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Corbett Lane Partners',
    tableObjectId: 'engagement',
    viewName: 'Live engagements',
    columns: [
      { id: 'name', label: 'Engagement', width: 200, isFirstColumn: true },
      { id: 'client', label: 'Client', width: 160 },
      { id: 'workstreams', label: 'Workstreams', width: 120, align: 'right' },
      { id: 'nextDeliverable', label: 'Next deliverable', width: 170 },
      { id: 'stage', label: 'Stage', width: 130 },
    ],
    rows: [
      engagementRow(
        'operating-model',
        'Operating model redesign',
        'Tidewell Insurance',
        '3',
        'Target model, Dec 4',
        { value: 'Delivering', color: 'green' },
      ),
      engagementRow(
        'market-entry',
        'Market entry study',
        'Orchard Robotics',
        '2',
        'Interview synthesis, Dec 9',
        { value: 'Delivering', color: 'green' },
      ),
      engagementRow(
        'cost-programme',
        'Cost programme',
        'Greyfield Mills',
        '4',
        'Baseline, Jan 8',
        { value: 'Kick-off', color: 'blue' },
      ),
      engagementRow(
        'due-diligence',
        'Commercial due diligence',
        'Pinecrest Capital',
        '2',
        'Draft report, Dec 2',
        { value: 'Final week', color: 'amber' },
      ),
    ],
    record: {
      name: 'Operating model redesign',
      createdAt: 'Added Sep 18',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'green', value: 'Delivering' },
        },
        {
          label: 'Client',
          value: { type: 'text', value: 'Tidewell Insurance' },
        },
        { label: 'Fee', value: { type: 'currency', value: '$420,000' } },
        { label: 'Ends on', value: { type: 'text', value: 'Feb 26, 2027' } },
        {
          label: 'Engagement lead',
          value: { type: 'person', name: 'Rachel Okonkwo', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'workstream',
      label: msg`Workstreams`,
      purpose: msg`One strand of an engagement, with its own lead and budget of days.`,
      fields: [
        { label: msg`Budgeted days` },
        { label: msg`Workstream lead`, relatesTo: 'consultant' },
        { label: msg`Engagement`, relatesTo: 'engagement' },
      ],
      previewIcon: 'folder',
      previewTone: 'orange',
    },
    {
      id: 'deliverable',
      label: msg`Deliverables`,
      purpose: msg`What the client receives, with a due date and a sign-off.`,
      fields: [
        { label: msg`Due on` },
        { label: msg`Client sign-off` },
        { label: msg`Workstream`, relatesTo: 'workstream' },
      ],
      previewIcon: 'checkbox',
      previewTone: 'pink',
    },
  ],
  workflows: [
    PROFESSIONAL_SERVICES_INDUSTRY_PAGE.workflows.items[0],
    {
      title: msg`Deliverable due reminder`,
      outcome: msg`No deliverable reaches its due date without a review.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        {
          kind: 'action',
          label: msg`Find deliverables due in 3 days without sign-off`,
        },
        { kind: 'action', label: msg`Email the workstream lead` },
        { kind: 'action', label: msg`Create a review task for the partner` },
      ],
    },
    {
      title: msg`Utilisation alert`,
      outcome: msg`Staffing hears about idle or overbooked consultants before the week starts.`,
      steps: [
        { kind: 'trigger', label: msg`Every Friday at 15:00` },
        {
          kind: 'action',
          label: msg`Find consultants under 50% or over 100% next week`,
        },
        { kind: 'action', label: msg`Post the list to the staffing channel` },
      ],
    },
  ],
  questions: [
    {
      question: msg`Migrating off Salesforce sounds like months of work.`,
      answer: msg`Alternative Partners moved to a self-hosted Twenty by briefing AI agents on the data, repository and deployment. One person oversaw it.`,
    },
  ],
  proof: { kind: 'caseStudy', caseStudySlug: 'alternative-partners' },
};
