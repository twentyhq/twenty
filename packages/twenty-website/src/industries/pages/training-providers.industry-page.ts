import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const cohortRow = (
  id: string,
  cohort: string,
  course: string,
  startsOn: string,
  booked: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' | 'red' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: cohort, shortLabel: cohort[0], tone: 'pink' },
    course: { type: 'text', value: course },
    startsOn: { type: 'text', value: startsOn },
    booked: { type: 'text', value: booked },
    status: { type: 'select', ...status },
  },
});

export const TRAINING_PROVIDERS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'training-providers',
  parentSlug: 'education',
  status: 'draft',
  name: msg`Training providers`,
  meta: {
    title: msg`Twenty for training providers — courses, cohorts and corporate clients`,
    description: msg`Model courses, cohorts, enrolments and corporate accounts in an open source CRM. See an example training provider workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Fill every cohort, *renew every client*`,
    body: msg`Courses, cohorts, enrolments and the corporate accounts that pay for them, in one workspace. Here is an example training provider workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Fieldstone Training',
    tableObjectId: 'cohort',
    viewName: 'Upcoming cohorts',
    columns: [
      { id: 'name', label: 'Cohort', width: 170, isFirstColumn: true },
      { id: 'course', label: 'Course', width: 200 },
      { id: 'startsOn', label: 'Starts on', width: 120 },
      { id: 'booked', label: 'Booked', width: 110 },
      { id: 'status', label: 'Status', width: 150 },
    ],
    rows: [
      cohortRow(
        'firstAidDec',
        'FAW Dec 2',
        'First Aid at Work',
        'Dec 2',
        '11 / 12',
        { value: 'Confirmed', color: 'green' },
      ),
      cohortRow(
        'firstAidDec9',
        'FAW Dec 9',
        'First Aid at Work',
        'Dec 9',
        '5 / 12',
        { value: 'Below minimum', color: 'red' },
      ),
      cohortRow(
        'leadershipJan',
        'NML Jan 13',
        'New Manager Leadership',
        'Jan 13',
        '9 / 14',
        { value: 'Filling', color: 'amber' },
      ),
      cohortRow(
        'halvorsen',
        'Halvorsen in-house',
        'Forklift Operator',
        'Jan 20',
        '8 / 8',
        { value: 'In-house', color: 'blue' },
      ),
      cohortRow('excelFeb', 'XLA Feb 3', 'Advanced Excel', 'Feb 3', '2 / 16', {
        value: 'Open',
        color: 'gray',
      }),
    ],
    record: {
      name: 'First Aid at Work',
      createdAt: 'Added Feb 6',
      fields: [
        {
          label: 'Format',
          value: { type: 'select', color: 'blue', value: 'In person' },
        },
        { label: 'Duration', value: { type: 'text', value: '3 days' } },
        { label: 'Minimum per cohort', value: { type: 'text', value: '8' } },
        {
          label: 'Course lead',
          value: { type: 'person', name: 'Grace Okafor', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`We find out a cohort is short the week before.`,
      answer: msg`A daily workflow flags cohorts below their minimum 14 days out and gives sales a task.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Corporate contracts renew without anyone calling.`,
      answer: msg`A weekly workflow finds contracts 60 days from renewal and briefs the account owner.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We cannot see which courses fill and which do not.`,
      answer: msg`Each course shows its cohorts, how many seats are booked and which are below minimum.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Trainers should not see what clients pay.`,
      answer: msg`Trainers see their own cohorts and learners. Field permissions hide contract values from them.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'course',
      label: msg`Courses`,
      purpose: msg`What you teach: format, duration and the minimum a cohort needs to run.`,
      fields: [
        { label: msg`Format` },
        { label: msg`Minimum per cohort` },
        { label: msg`Course lead`, relatesTo: 'person' },
      ],
      previewIcon: 'book',
      previewTone: 'blue',
    },
    {
      id: 'cohort',
      label: msg`Cohorts`,
      purpose: msg`One run of a course on set dates, open to anyone or booked in-house.`,
      fields: [
        { label: msg`Starts on` },
        { label: msg`Seats` },
        { label: msg`Course`, relatesTo: 'course' },
        { label: msg`Booked by`, relatesTo: 'company' },
      ],
      previewIcon: 'users',
      previewTone: 'pink',
    },
    {
      id: 'enrolment',
      label: msg`Enrolments`,
      purpose: msg`One learner on one cohort, with who paid and whether they completed.`,
      fields: [
        { label: msg`Completed on` },
        { label: msg`Learner`, relatesTo: 'person' },
        { label: msg`Cohort`, relatesTo: 'cohort' },
        { label: msg`Paid by`, relatesTo: 'company' },
      ],
      previewIcon: 'school',
      previewTone: 'teal',
    },
  ],
  omittedObjectIds: ['student', 'application', 'intake', 'visa', 'document'],
  modelNotes: [
    {
      title: msg`Courses and cohorts are separate`,
      body: msg`A course is what you sell. A cohort is one run of it, with dates, seats and a trainer.`,
    },
    {
      title: msg`Learners are people`,
      body: msg`An enrolment links a person to a cohort, so their history follows them across courses.`,
    },
    {
      title: msg`The payer is a company`,
      body: msg`Corporate bookings link each enrolment to the employer paying for it.`,
    },
  ],
  workflows: [
    {
      title: msg`Cohort fill check`,
      outcome: msg`Sales hears about a short cohort two weeks out, not two days.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find cohorts starting in 14 days` },
        { kind: 'action', label: msg`Keep those below their minimum` },
        { kind: 'agent', label: msg`List past learners to invite` },
        { kind: 'action', label: msg`Create a task for sales` },
      ],
    },
    {
      title: msg`Course completion follow-up`,
      outcome: msg`Every learner gets their certificate, and their account gets a next course to consider.`,
      steps: [
        { kind: 'trigger', label: msg`Enrolment is marked completed` },
        { kind: 'action', label: msg`Email the learner their certificate` },
        { kind: 'agent', label: msg`Suggest a next course` },
        {
          kind: 'action',
          label: msg`Create an upsell task for the account owner`,
        },
      ],
    },
    {
      title: msg`Corporate renewal watch`,
      outcome: msg`Every corporate account hears from you 60 days before its contract renews.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        {
          kind: 'action',
          label: msg`Find accounts whose contract renews in 60 days`,
        },
        { kind: 'agent', label: msg`Summarize the year's enrolments` },
        {
          kind: 'action',
          label: msg`Create a renewal task for the account owner`,
        },
      ],
    },
  ],
  agents: {
    heading: msg`Agents that find the next booking. *Sales makes the call*`,
    items: [
      {
        name: msg`Cohort filler`,
        job: msg`Finds past learners and accounts likely to book a cohort that is below its minimum.`,
        reads: ['cohort', 'course', 'enrolment', 'company', 'person'],
        writes: ['task', 'note'],
        limit: msg`Cannot email anyone or create enrolments.`,
      },
      {
        name: msg`Renewal briefer`,
        job: msg`Writes a note on each renewing account: courses taken, completion rate and gaps.`,
        reads: ['company', 'enrolment', 'cohort', 'course'],
        writes: ['note'],
        limit: msg`Cannot change a contract or its value.`,
      },
    ],
  },
  customScreen: {
    title: msg`Cohort fill rate`,
    placedOn: 'course',
    description: msg`Every upcoming cohort of a course, with seats booked against its minimum.`,
    preview: {
      tabLabel: 'Cohorts',
      title: 'Cohort fill rate',
      caption: 'Minimum 8 learners to run',
      columns: ['Cohort', 'Starts on', 'Booked', 'Status'],
      rows: [
        {
          id: 'dec2',
          cells: [
            { type: 'text', value: 'FAW Dec 2' },
            { type: 'text', value: 'Dec 2' },
            { type: 'text', value: '11 / 12' },
            { type: 'select', color: 'green', value: 'Confirmed' },
          ],
        },
        {
          id: 'dec9',
          highlighted: true,
          cells: [
            { type: 'text', value: 'FAW Dec 9' },
            { type: 'text', value: 'Dec 9' },
            { type: 'text', value: '5 / 12' },
            { type: 'select', color: 'red', value: 'Below minimum' },
          ],
        },
        {
          id: 'pemberton',
          cells: [
            { type: 'text', value: 'Pemberton Foods in-house' },
            { type: 'text', value: 'Jan 8' },
            { type: 'text', value: '10 / 10' },
            { type: 'select', color: 'blue', value: 'In-house' },
          ],
        },
        {
          id: 'jan27',
          cells: [
            { type: 'text', value: 'FAW Jan 27' },
            { type: 'text', value: 'Jan 27' },
            { type: 'text', value: '3 / 12' },
            { type: 'select', color: 'gray', value: 'Open' },
          ],
        },
      ],
      footnote: 'Dec 9 needs three more learners by Nov 25 to run.',
    },
  },
  access: {
    heading: msg`Sales keeps its accounts. *Trainers see their cohorts*`,
    roles: [
      { id: 'sales', label: msg`Sales` },
      { id: 'coordinator', label: msg`Coordinator` },
      { id: 'trainer', label: msg`Trainer` },
    ],
    rules: [
      {
        objectId: 'company',
        accessByRoleId: {
          sales: msg`Own accounts`,
          coordinator: msg`View all`,
          trainer: msg`No access`,
        },
      },
      {
        objectId: 'cohort',
        accessByRoleId: {
          sales: msg`View all`,
          coordinator: msg`See and edit all`,
          trainer: msg`Own cohorts`,
        },
      },
      {
        objectId: 'enrolment',
        accessByRoleId: {
          sales: msg`On own accounts`,
          coordinator: msg`See and edit all`,
          trainer: msg`Mark completion on own cohorts`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'cohort' },
      { salesforceObject: 'Course (custom)', objectId: 'course' },
      { salesforceObject: 'Enrolment (custom)', objectId: 'enrolment' },
    ],
    note: msg`Corporate deals usually become in-house cohorts. Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  discovery: [
    {
      question: msg`How much of your revenue comes from corporate clients?`,
      shapes: msg`Decides how much of the workspace centres on accounts and renewals.`,
    },
    {
      question: msg`How many cohorts run each month?`,
      shapes: msg`Sets the cohort views and the fill check schedule.`,
    },
    {
      question: msg`When do you cancel a cohort that is short?`,
      shapes: msg`Sets the minimum per course and when the fill check runs.`,
    },
    {
      question: msg`Where do bookings and payments come in today?`,
      shapes: msg`Each booking tool becomes a webhook, an import or an API call.`,
    },
    {
      question: msg`What should trainers see and edit?`,
      shapes: msg`Sets the trainer role and its field permissions.`,
    },
  ],
  questions: [
    {
      question: msg`Do open and in-house courses need separate setups?`,
      answer: msg`No. A cohort is either open or in-house, and an in-house cohort links to the account that booked it.`,
    },
    {
      question: msg`Can trainers record completions?`,
      answer: msg`Yes. Give trainers a role that edits enrolments on their own cohorts only.`,
    },
  ],
  proof: { kind: 'none' },
};
