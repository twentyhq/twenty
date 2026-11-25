import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const applicationRow = (
  id: string,
  name: string,
  applicant: string,
  programme: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  officer: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    applicant: { type: 'entity', name: applicant },
    programme: { type: 'text', value: programme },
    status: { type: 'select', ...status },
    officer: { type: 'person', name: officer, kind: 'person', tone: 'gray' },
  },
});

export const GOVERNMENT_AGENCIES_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'government-agencies',
  parentSlug: 'public-sector-defense',
  status: 'draft',
  name: msg`Government agencies`,
  meta: {
    title: msg`Twenty for government agencies — stakeholder relationships on software you control`,
    description: msg`Track businesses, partners, programme applications and agreements in an open source CRM you can host yourself. See an example agency workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Serve your stakeholders from software *you control*`,
    body: msg`Businesses, partners and grant recipients, with every engagement, application and agreement on servers you choose. Here is an example agency workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ardmoor Enterprise Agency',
    tableObjectId: 'programmeApplication',
    viewName: 'Open applications',
    columns: [
      { id: 'name', label: 'Application', width: 200, isFirstColumn: true },
      { id: 'applicant', label: 'Applicant', width: 180 },
      { id: 'programme', label: 'Programme', width: 190 },
      { id: 'status', label: 'Status', width: 140 },
      { id: 'officer', label: 'Programme officer', width: 170 },
    ],
    rows: [
      applicationRow(
        'cold-chain',
        'Cold-chain expansion',
        'Brackwell Foods',
        'Regional Growth Fund',
        { value: 'In review', color: 'amber' },
        'Priya Nandakumar',
      ),
      applicationRow(
        'battery',
        'Battery recycling pilot',
        'Corrin Materials',
        'Clean Industry Programme',
        { value: 'Eligibility check', color: 'blue' },
        'Tomas Reyes',
      ),
      applicationRow(
        'apprentice',
        'Apprentice academy',
        'Fenwick Engineering',
        'Skills Partnership',
        { value: 'Approved', color: 'green' },
        'Priya Nandakumar',
      ),
      applicationRow(
        'harbour',
        'Harbour connectivity',
        'Lowmere Digital',
        'Regional Growth Fund',
        { value: 'Submitted', color: 'gray' },
        'Hanna Kowalczyk',
      ),
    ],
    record: {
      name: 'Brackwell Foods',
      createdAt: 'Added Mar 4',
      fields: [
        {
          label: 'Sector',
          value: {
            type: 'select',
            color: 'green',
            value: 'Food manufacturing',
          },
        },
        { label: 'Region', value: { type: 'text', value: 'Eastern district' } },
        { label: 'Employees', value: { type: 'text', value: '240' } },
        {
          label: 'Relationship owner',
          value: { type: 'person', name: 'Priya Nandakumar', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'engagement',
      label: msg`Engagements`,
      purpose: msg`A meeting, visit or call with a stakeholder organisation, and what came of it.`,
      fields: [
        { label: msg`Date` },
        { label: msg`Outcome` },
        { label: msg`Organisation`, relatesTo: 'company' },
        { label: msg`Attendees`, relatesTo: 'person' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'blue',
    },
    {
      id: 'programmeApplication',
      label: msg`Programme applications`,
      purpose: msg`A business applying to a funding or support programme, from submission to decision.`,
      fields: [
        { label: msg`Status` },
        { label: msg`Amount requested` },
        { label: msg`Applicant`, relatesTo: 'company' },
        { label: msg`Programme`, relatesTo: 'programme' },
      ],
      previewIcon: 'notes',
      previewTone: 'orange',
    },
    {
      id: 'partnerAgreement',
      label: msg`Partner agreements`,
      purpose: msg`A signed agreement with a delivery partner, with its scope and end date.`,
      fields: [
        { label: msg`Scope` },
        { label: msg`Ends on` },
        { label: msg`Partner`, relatesTo: 'company' },
        { label: msg`Programme`, relatesTo: 'programme' },
      ],
      previewIcon: 'briefcase',
      previewTone: 'pink',
    },
  ],
  workflows: [
    {
      title: msg`Application submitted`,
      outcome: msg`Every application gets an eligibility check and a summary the officer can read in two minutes.`,
      steps: [
        { kind: 'trigger', label: msg`Programme application created` },
        {
          kind: 'action',
          label: msg`Create an eligibility check task for the programme officer`,
        },
        { kind: 'agent', label: msg`Summarise the application as a note` },
        { kind: 'action', label: msg`Set the status to eligibility check` },
      ],
    },
    {
      title: msg`Partner agreement expiring`,
      outcome: msg`Renewals start months before a delivery partner's agreement ends.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        {
          kind: 'action',
          label: msg`Find partner agreements ending within 120 days`,
        },
        {
          kind: 'action',
          label: msg`Create a renewal task for the relationship manager`,
        },
        { kind: 'action', label: msg`Email the partner's main contact` },
      ],
    },
    {
      title: msg`Briefing drafted`,
      outcome: msg`A ministerial or board briefing starts from the full engagement history, not from memory.`,
      steps: [
        { kind: 'trigger', label: msg`Run manually from a company` },
        {
          kind: 'action',
          label: msg`Find engagements and applications from the last 12 months`,
        },
        { kind: 'agent', label: msg`Draft the briefing as a note` },
        {
          kind: 'action',
          label: msg`Create a review task for the head of unit`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Engagement history`,
    placedOn: 'company',
    description: msg`Shows every meeting, visit and call with an organisation, with who attended and what was agreed.`,
    preview: {
      tabLabel: 'Engagements',
      title: 'Engagement history',
      caption: 'Last 12 months',
      columns: ['Date', 'Engagement', 'With', 'Outcome'],
      rows: [
        {
          id: 'site-visit',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Nov 19' },
            { type: 'text', value: 'Site visit' },
            { type: 'person', name: 'Hanna Kowalczyk', kind: 'person' },
            { type: 'select', color: 'amber', value: 'Follow-up due' },
          ],
        },
        {
          id: 'application-call',
          cells: [
            { type: 'text', value: 'Oct 30' },
            { type: 'text', value: 'Application call' },
            { type: 'person', name: 'Priya Nandakumar', kind: 'person' },
            { type: 'select', color: 'green', value: 'Applied' },
          ],
        },
        {
          id: 'roundtable',
          cells: [
            { type: 'text', value: 'Jul 8' },
            { type: 'text', value: 'Food sector roundtable' },
            { type: 'person', name: 'Tomas Reyes', kind: 'person' },
            { type: 'select', color: 'blue', value: 'Attended' },
          ],
        },
        {
          id: 'export-workshop',
          cells: [
            { type: 'text', value: 'Apr 15' },
            { type: 'text', value: 'Export workshop' },
            { type: 'person', name: 'Hanna Kowalczyk', kind: 'person' },
            { type: 'select', color: 'gray', value: 'No action' },
          ],
        },
      ],
      footnote:
        'The site visit raised a question on match funding. Answer it before the review.',
    },
  },
  agents: {
    heading: msg`Agents prepare the file. *Officers make the call*`,
    items: [
      {
        name: msg`Application reader`,
        job: msg`Reads a new application, checks it against the programme criteria and writes a summary note.`,
        reads: ['programmeApplication', 'programme', 'company'],
        writes: ['note'],
        limit: msg`Runs on your own AI provider and cannot approve or reject an application.`,
      },
      {
        name: msg`Briefing writer`,
        job: msg`Drafts a ministerial or board briefing from an organisation's engagements, applications and agreements.`,
        reads: [
          'engagement',
          'programmeApplication',
          'partnerAgreement',
          'company',
        ],
        writes: ['note'],
        limit: msg`Drafts only. A person edits and signs off every briefing.`,
      },
    ],
  },
  access: {
    heading: msg`Officers see their programmes. *Leadership sees the whole picture*`,
    roles: [
      { id: 'programmeOfficer', label: msg`Programme officers` },
      { id: 'relationshipManager', label: msg`Relationship managers` },
      { id: 'leadership', label: msg`Leadership` },
    ],
    rules: [
      {
        objectId: 'programmeApplication',
        accessByRoleId: {
          programmeOfficer: msg`See their programmes, edit assigned`,
          relationshipManager: msg`See status, not scores`,
          leadership: msg`See all, including scores`,
        },
      },
      {
        objectId: 'engagement',
        accessByRoleId: {
          programmeOfficer: msg`See all, edit own`,
          relationshipManager: msg`See and edit all`,
          leadership: msg`See all`,
        },
      },
      {
        objectId: 'partnerAgreement',
        accessByRoleId: {
          programmeOfficer: msg`See their programmes`,
          relationshipManager: msg`See and edit all`,
          leadership: msg`See all, including value`,
        },
      },
    ],
  },
  questions: [
    {
      question: msg`We work with businesses, not citizen casework.`,
      answer: msg`Each organisation is a company record, with its engagements, applications and agreements attached.`,
    },
    {
      question: msg`Can briefings be drafted without a public AI service?`,
      answer: msg`Yes. Self-host Twenty and connect a custom AI provider, available on the Organization plan and above.`,
    },
  ],
};
