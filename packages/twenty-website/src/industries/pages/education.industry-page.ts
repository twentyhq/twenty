import { msg } from '@lingui/core/macro';
import { IconSchool } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const studentRow = (
  id: string,
  name: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' | 'red' },
  intake: string,
  provider: string,
  counsellor: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    stage: { type: 'select', ...stage },
    intake: { type: 'text', value: intake },
    provider: { type: 'entity', name: provider },
    counsellor: {
      type: 'person',
      name: counsellor,
      kind: 'person',
      tone: 'gray',
    },
  },
});

export const EDUCATION_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'education',
  status: 'draft',
  name: msg`Education`,
  menu: {
    description: msg`Students, applications and intakes`,
    icon: IconSchool,
  },
  meta: {
    title: msg`Twenty for education — a CRM built around students and intakes`,
    description: msg`Model students, applications, intakes, visas and documents in an open source CRM. See an example education agency workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every applicant, every intake, every deadline, *on one record*`,
    body: msg`Students, applications, providers and visas, not contacts and deals. Here is an example education agency workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Northstar Pathways',
    tableObjectId: 'student',
    viewName: 'All Students',
    columns: [
      { id: 'name', label: 'Student', width: 180, isFirstColumn: true },
      { id: 'stage', label: 'Stage', width: 140 },
      { id: 'intake', label: 'Intake', width: 120 },
      { id: 'provider', label: 'Provider', width: 190 },
      { id: 'counsellor', label: 'Counsellor', width: 160 },
    ],
    rows: [
      studentRow(
        'linh',
        'Linh Tran',
        { value: 'Visa lodged', color: 'amber' },
        'Feb 2027',
        'Harbourside University',
        'Sofia Marquez',
      ),
      studentRow(
        'arjun',
        'Arjun Mehta',
        { value: 'Offer received', color: 'blue' },
        'Feb 2027',
        'Lakemont College',
        'Daniel Kerr',
      ),
      studentRow(
        'camila',
        'Camila Rocha',
        { value: 'Enrolled', color: 'green' },
        'Jul 2026',
        'Eastgate Institute',
        'Sofia Marquez',
      ),
      studentRow(
        'yuki',
        'Yuki Sato',
        { value: 'Documents missing', color: 'red' },
        'Feb 2027',
        'Harbourside University',
        'Amira Haddad',
      ),
      studentRow(
        'kwame',
        'Kwame Mensah',
        { value: 'Applied', color: 'blue' },
        'Jul 2027',
        'Ridgeview Business School',
        'Daniel Kerr',
      ),
      studentRow(
        'elena',
        'Elena Petrova',
        { value: 'Enquiry', color: 'gray' },
        'Jul 2027',
        'Lakemont College',
        'Amira Haddad',
      ),
    ],
    record: {
      name: 'Linh Tran',
      createdAt: 'Added Aug 12',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Visa lodged' },
        },
        { label: 'Intake', value: { type: 'text', value: 'Feb 2027' } },
        {
          label: 'Visa',
          value: { type: 'select', color: 'blue', value: 'Student visa' },
        },
        {
          label: 'Counsellor',
          value: { type: 'person', name: 'Sofia Marquez', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our vendor shut down and left us a CSV.`,
      answer: msg`AC&T Education Migration rebuilt from a CSV export on self-hosted Twenty. Adding a record now takes under a minute.`,
      answeredBy: 'proof',
    },
    {
      complaint: msg`Statuses go stale between intakes.`,
      answer: msg`A nightly workflow updates enrolments from their dates, so nobody edits them by hand.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Counsellors juggle hundreds of students.`,
      answer: msg`Each counsellor sees their own students first, and partner agents see only the students they referred.`,
      answeredBy: 'access',
    },
    {
      complaint: msg`We need our CRM inside our own product.`,
      answer: msg`Students, applications and intakes are your own objects, each with a REST and GraphQL API.`,
      answeredBy: 'dataModel',
    },
  ],
  dataModel: {
    heading: msg`A model centred *on the student*`,
    objects: [
      {
        id: 'student',
        label: msg`Students`,
        purpose: msg`The person you guide, from first enquiry to enrolment and beyond.`,
        fields: [
          { label: msg`Stage` },
          { label: msg`Nationality` },
          { label: msg`Contact`, relatesTo: 'person' },
        ],
        previewIcon: 'user',
        previewTone: 'blue',
      },
      {
        id: 'application',
        label: msg`Applications`,
        purpose: msg`One student applying to one provider for one intake.`,
        fields: [
          { label: msg`Status` },
          { label: msg`Student`, relatesTo: 'student' },
          { label: msg`Provider`, relatesTo: 'company' },
          { label: msg`Intake`, relatesTo: 'intake' },
        ],
        previewIcon: 'fileText',
        previewTone: 'purple',
      },
      {
        id: 'intake',
        label: msg`Intakes`,
        purpose: msg`A start date at a provider, with its application deadline.`,
        fields: [
          { label: msg`Starts on` },
          { label: msg`Application deadline` },
          { label: msg`Provider`, relatesTo: 'company' },
        ],
        previewIcon: 'calendarEvent',
        previewTone: 'green',
      },
      {
        id: 'enrolment',
        label: msg`Enrolments`,
        purpose: msg`A confirmed place, with start and end dates that drive its status.`,
        fields: [
          { label: msg`Starts on` },
          { label: msg`Ends on` },
          { label: msg`Application`, relatesTo: 'application' },
        ],
        previewIcon: 'school',
        previewTone: 'teal',
      },
      {
        id: 'visa',
        label: msg`Visas`,
        purpose: msg`A visa application, with its lodgement date, outcome and expiry.`,
        fields: [
          { label: msg`Lodged on` },
          { label: msg`Expires on` },
          { label: msg`Student`, relatesTo: 'student' },
        ],
        previewIcon: 'shieldCheck',
        previewTone: 'amber',
      },
      {
        id: 'document',
        label: msg`Documents`,
        purpose: msg`A passport, transcript or test result, with its type and expiry.`,
        fields: [
          { label: msg`Type` },
          { label: msg`Expires on` },
          { label: msg`Student`, relatesTo: 'student' },
        ],
        previewIcon: 'folder',
        previewTone: 'gray',
      },
    ],
    notes: [
      {
        title: msg`Providers are companies`,
        body: msg`Universities and colleges sit in Companies, with every intake and application linked to them.`,
      },
      {
        title: msg`One student, many applications`,
        body: msg`A student applies to three providers for two intakes. Each application keeps its own status.`,
      },
      {
        title: msg`Documents are records`,
        body: msg`Type and expiry are fields, so a workflow can find what is missing before a deadline.`,
      },
    ],
  },
  workflows: {
    heading: msg`Statuses stay current. *Counsellors keep the advice*`,
    items: [
      {
        title: msg`Nightly enrolment refresh`,
        outcome: msg`Every enrolment shows its real status each morning.`,
        steps: [
          { kind: 'trigger', label: msg`Every night at 01:00` },
          {
            kind: 'action',
            label: msg`Find enrolments whose dates have passed`,
          },
          { kind: 'action', label: msg`Update the enrolment status` },
          { kind: 'action', label: msg`Update the student's stage` },
        ],
      },
      {
        title: msg`Missing document chase`,
        outcome: msg`No application stalls on a missing transcript two weeks before an intake.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find intakes starting in 14 days` },
          { kind: 'action', label: msg`Check each applicant's documents` },
          { kind: 'action', label: msg`Email the student what is missing` },
          { kind: 'action', label: msg`Create a task for the counsellor` },
        ],
      },
      {
        title: msg`Campus event sign-up`,
        outcome: msg`Every sign-up at an event becomes a student with a booked session.`,
        steps: [
          { kind: 'trigger', label: msg`Sign-up form calls a webhook` },
          { kind: 'action', label: msg`Create or update the student` },
          { kind: 'action', label: msg`Assign a counsellor` },
          { kind: 'action', label: msg`Email a link to book a session` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that check the file. *Counsellors decide*`,
    items: [
      {
        name: msg`Application checker`,
        job: msg`Reads a student's documents and flags what each provider still needs.`,
        reads: ['student', 'application', 'document', 'company'],
        writes: ['task', 'note'],
        limit: msg`Cannot change an application's status.`,
      },
    ],
  },
  customScreen: {
    title: msg`Student journey`,
    placedOn: 'student',
    description: msg`Every application on one timeline, from first enquiry to enrolment.`,
    preview: {
      tabLabel: 'Journey',
      title: 'Student journey',
      caption: 'From enquiry to enrolment',
      columns: ['Step', 'Provider', 'Date', 'Status'],
      rows: [
        {
          id: 'enquiry',
          cells: [
            { type: 'text', value: 'Enquiry' },
            { type: 'text', value: 'None yet' },
            { type: 'text', value: 'Aug 12' },
            { type: 'select', color: 'gray', value: 'Done' },
          ],
        },
        {
          id: 'applied',
          cells: [
            { type: 'text', value: 'Application' },
            { type: 'entity', name: 'Harbourside University' },
            { type: 'text', value: 'Sep 3' },
            { type: 'select', color: 'green', value: 'Offer' },
          ],
        },
        {
          id: 'visa',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Visa' },
            { type: 'entity', name: 'Harbourside University' },
            { type: 'text', value: 'Oct 21' },
            { type: 'select', color: 'amber', value: 'Lodged' },
          ],
        },
        {
          id: 'enrolment',
          cells: [
            { type: 'text', value: 'Enrolment' },
            { type: 'entity', name: 'Harbourside University' },
            { type: 'text', value: 'Feb 2027' },
            { type: 'select', color: 'blue', value: 'Upcoming' },
          ],
        },
      ],
      footnote: 'Visa decision is the last step before the February intake.',
    },
  },
  access: {
    heading: msg`Counsellors keep their students. *Managers see every intake*`,
    roles: [
      { id: 'counsellor', label: msg`Counsellor` },
      { id: 'partnerAgent', label: msg`Partner agent` },
      { id: 'manager', label: msg`Manager` },
    ],
    rules: [
      {
        objectId: 'student',
        accessByRoleId: {
          counsellor: msg`Own students`,
          partnerAgent: msg`Students they referred`,
          manager: msg`See and edit all`,
        },
      },
      {
        objectId: 'application',
        accessByRoleId: {
          counsellor: msg`On own students`,
          partnerAgent: msg`View on referred students`,
          manager: msg`See and edit all`,
        },
      },
      {
        objectId: 'document',
        accessByRoleId: {
          counsellor: msg`On own students`,
          partnerAgent: msg`Upload on referred students`,
          manager: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Education Cloud',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'student' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Individual Application', objectId: 'application' },
      { salesforceObject: 'Academic Term', objectId: 'intake' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  proof: { kind: 'caseStudy', caseStudySlug: 'act-education' },
  questions: [
    {
      question: msg`How do we keep student data private?`,
      answer: msg`Host Twenty yourself in your own country. Roles, field permissions and row-level rules decide who sees what.`,
    },
    {
      question: msg`Can students log in?`,
      answer: msg`Not to the CRM. Use the API to show application status in your own student portal.`,
    },
    {
      question: msg`We have no developers.`,
      answer: msg`Objects, views and workflows are built without code. For a larger setup, a Twenty partner can do the work.`,
    },
    {
      question: msg`What does switching cost?`,
      answer: msg`Twenty is priced per seat, and the open source edition can be self-hosted. Import your records by CSV or through the API.`,
    },
  ],
  discovery: [
    {
      question: msg`How many students per intake?`,
      shapes: msg`Sets the views and how counsellors split the work.`,
    },
    {
      question: msg`How many providers do you work with?`,
      shapes: msg`Decides whether requirements live on the provider or the intake.`,
    },
    {
      question: msg`Which statuses change without you doing anything?`,
      shapes: msg`Usually the first scheduled workflow to build.`,
    },
    {
      question: msg`Who outside the company needs access?`,
      shapes: msg`Sets the partner agent role and its row-level rules.`,
    },
    {
      question: msg`What do you use for forms and documents?`,
      shapes: msg`Each tool becomes a webhook, an import or an API call.`,
    },
  ],
};
