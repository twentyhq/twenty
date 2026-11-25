import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const pilotRow = (
  id: string,
  name: string,
  practice: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'red' },
  endsOn: string,
  manager: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    practice: { type: 'entity', name: practice },
    status: { type: 'select', ...status },
    endsOn: { type: 'text', value: endsOn },
    manager: { type: 'person', name: manager, kind: 'person', tone: 'gray' },
  },
});

export const HEALTHTECH_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'healthtech',
  parentSlug: 'healthcare-life-sciences',
  status: 'draft',
  name: msg`Healthtech`,
  meta: {
    title: msg`Twenty for healthtech — track pilots, rollouts and integrations by practice`,
    description: msg`Track practices, pilots, rollouts and integrations in an open source CRM you can host yourself. See an example workspace for a team selling software to practices and hospitals.`,
  },
  hero: {
    headline: msg`From pilot to rollout, *across every practice*`,
    body: msg`Practices, pilots, rollouts and integrations, for teams selling software to clinics and hospitals. Here is an example healthtech workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Quillon Health',
    tableObjectId: 'pilot',
    viewName: 'Active pilots',
    columns: [
      { id: 'name', label: 'Pilot', width: 200, isFirstColumn: true },
      { id: 'practice', label: 'Practice', width: 200 },
      { id: 'status', label: 'Status', width: 140 },
      { id: 'endsOn', label: 'Ends on', width: 130 },
      { id: 'manager', label: 'Success manager', width: 160 },
    ],
    rows: [
      pilotRow(
        'fernhill',
        'Online booking, 90 days',
        'Fernhill Orthopaedics',
        { value: 'Ending soon', color: 'amber' },
        'Dec 9, 2026',
        'Lena Vasquez',
      ),
      pilotRow(
        'ashdown',
        'Patient reminders, 2 sites',
        'Ashdown Family Health',
        { value: 'On track', color: 'green' },
        'Feb 14, 2027',
        'Dev Kapoor',
      ),
      pilotRow(
        'wrenfield',
        'Online booking, 60 days',
        'Wrenfield Dental Group',
        { value: 'Integration blocked', color: 'red' },
        'Jan 22, 2027',
        'Clara Holm',
      ),
      pilotRow(
        'marlow-vale',
        'Waitlist, 1 site',
        'Marlow Vale Pediatrics',
        { value: 'Starting', color: 'blue' },
        'Mar 3, 2027',
        'Lena Vasquez',
      ),
      pilotRow(
        'stonebridge',
        'Online booking, 90 days',
        'Stonebridge Eye Clinic',
        { value: 'Converted', color: 'green' },
        'Nov 4, 2026',
        'Dev Kapoor',
      ),
    ],
    record: {
      name: 'Online booking, 90 days',
      createdAt: 'Added Sep 10',
      fields: [
        {
          label: 'Practice',
          value: { type: 'text', value: 'Fernhill Orthopaedics' },
        },
        {
          label: 'Status',
          value: { type: 'select', color: 'amber', value: 'Ending soon' },
        },
        { label: 'Ends on', value: { type: 'text', value: 'Dec 9, 2026' } },
        {
          label: 'Success manager',
          value: { type: 'person', name: 'Lena Vasquez', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Pilots end and nobody wrote down whether they worked.`,
      answer: msg`Each pilot carries its success criteria, and a screen shows where every one stands.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`We hear about a broken integration from the practice, not from our team.`,
      answer: msg`When an integration's status changes, a workflow tells the customer success manager the same minute.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Our CRM stops at the signature, and rollouts live in spreadsheets.`,
      answer: msg`Pilots, rollouts and integrations are records tied to the practice, from first trial to last site live.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Hospitals ask where our customer data lives.`,
      answer: msg`Host Twenty on your own servers. Patient data stays in the clinical systems your product connects to.`,
      answeredBy: 'switching',
    },
  ],
  addedObjects: [
    {
      id: 'facility',
      label: msg`Practices`,
      purpose: msg`A practice, clinic group or hospital that buys your software. Or use companies.`,
      fields: [
        { label: msg`Type` },
        { label: msg`Number of sites` },
        { label: msg`Clinical system` },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'blue',
    },
    {
      id: 'pilot',
      label: msg`Pilots`,
      purpose: msg`A time-boxed trial at one practice, with success criteria agreed up front.`,
      fields: [
        { label: msg`Ends on` },
        { label: msg`Success criteria` },
        { label: msg`Practice`, relatesTo: 'facility' },
        { label: msg`Deal`, relatesTo: 'deal' },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'orange',
    },
    {
      id: 'rollout',
      label: msg`Rollouts`,
      purpose: msg`Deployment across a practice's sites once a pilot converts, one site at a time.`,
      fields: [
        { label: msg`Sites live` },
        { label: msg`Target date` },
        { label: msg`Pilot`, relatesTo: 'pilot' },
        { label: msg`Practice`, relatesTo: 'facility' },
      ],
      previewIcon: 'planet',
      previewTone: 'green',
    },
    {
      id: 'integration',
      label: msg`Integrations`,
      purpose: msg`Your product's connection to a practice's clinical system, with its current status.`,
      fields: [
        { label: msg`System` },
        { label: msg`Status` },
        { label: msg`Practice`, relatesTo: 'facility' },
      ],
      previewIcon: 'key',
      previewTone: 'purple',
    },
  ],
  workflows: [
    {
      title: msg`Pilot ending`,
      outcome: msg`Every pilot ends with a written result, ready two weeks early.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find pilots ending in 14 days` },
        {
          kind: 'agent',
          label: msg`Draft a success summary against the criteria`,
        },
        {
          kind: 'action',
          label: msg`Create a review task for the account executive`,
        },
      ],
    },
    {
      title: msg`Integration status change`,
      outcome: msg`The success manager knows an integration broke before the practice calls.`,
      steps: [
        { kind: 'trigger', label: msg`Integration status is updated` },
        {
          kind: 'action',
          label: msg`Find the practice and its success manager`,
        },
        {
          kind: 'action',
          label: msg`Email the success manager the new status`,
        },
        { kind: 'action', label: msg`If blocked, create a task to fix it` },
      ],
    },
    {
      title: msg`Rollout site goes live`,
      outcome: msg`Every new site starts onboarding the day it goes live.`,
      steps: [
        { kind: 'trigger', label: msg`Rollout site is marked live` },
        { kind: 'action', label: msg`Create onboarding tasks for the site` },
        { kind: 'action', label: msg`Email the practice its training dates` },
        { kind: 'action', label: msg`Update sites live on the rollout` },
      ],
    },
  ],
  customScreen: {
    title: msg`Pilot success criteria`,
    placedOn: 'pilot',
    description: msg`Each criterion agreed at the start of the pilot, its target, where it stands today and whether it is met.`,
    preview: {
      tabLabel: 'Success criteria',
      title: 'Success criteria',
      caption: 'Day 76 of 90',
      columns: ['Criterion', 'Target', 'Today', 'Status'],
      rows: [
        {
          id: 'online-share',
          cells: [
            { type: 'text', value: 'Bookings made online' },
            { type: 'text', value: '40%' },
            { type: 'text', value: '46%' },
            { type: 'select', color: 'green', value: 'Met' },
          ],
        },
        {
          id: 'no-shows',
          highlighted: true,
          cells: [
            { type: 'text', value: 'No-show rate' },
            { type: 'text', value: 'Under 8%' },
            { type: 'text', value: '9.5%' },
            { type: 'select', color: 'amber', value: 'Behind' },
          ],
        },
        {
          id: 'desk-time',
          cells: [
            { type: 'text', value: 'Front desk time per booking' },
            { type: 'text', value: 'Under 2 min' },
            { type: 'text', value: '1 min 40 s' },
            { type: 'select', color: 'green', value: 'Met' },
          ],
        },
        {
          id: 'active-staff',
          cells: [
            { type: 'text', value: 'Staff active weekly' },
            { type: 'text', value: '25 of 30' },
            { type: 'text', value: '27 of 30' },
            { type: 'select', color: 'green', value: 'Met' },
          ],
        },
      ],
      footnote: 'One criterion behind with two weeks left.',
    },
  },
  agents: {
    heading: msg`Agents that write the pilot report. *Your team makes the call*`,
    items: [
      {
        name: msg`Pilot reviewer`,
        job: msg`Two weeks before a pilot ends, drafts a success summary against its criteria in a note.`,
        reads: ['pilot', 'facility', 'integration', 'note'],
        writes: ['note'],
        limit: msg`Drafts only. The account executive edits it and decides what the practice sees.`,
      },
      {
        name: msg`Rollout planner`,
        job: msg`When a pilot converts, proposes a rollout plan and tasks per site from the practice's integration status.`,
        reads: ['pilot', 'rollout', 'integration', 'facility'],
        writes: ['rollout', 'task'],
        limit: msg`Cannot change deal values or mark a pilot as converted.`,
      },
    ],
  },
  questions: [
    {
      question: msg`Can we track integrations with each practice's clinical system?`,
      answer: msg`Yes, as records with a status. Your integration platform can update them through the API, and a workflow tells the right person.`,
    },
    {
      question: msg`Should pilot results include patient information?`,
      answer: msg`No. Track success criteria as aggregate figures, and leave patient records in the practice's own systems.`,
    },
  ],
};
