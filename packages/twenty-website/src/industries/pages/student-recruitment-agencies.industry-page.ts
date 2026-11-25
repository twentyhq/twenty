import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const offerLetterRow = (
  id: string,
  student: string,
  provider: string,
  course: string,
  acceptBy: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' | 'red' },
): RowDef => ({
  id,
  cells: {
    name: {
      type: 'text',
      value: student,
      shortLabel: student[0],
      tone: 'orange',
    },
    provider: { type: 'entity', name: provider },
    course: { type: 'text', value: course },
    acceptBy: { type: 'text', value: acceptBy },
    status: { type: 'select', ...status },
  },
});

export const STUDENT_RECRUITMENT_AGENCIES_INDUSTRY_PAGE: IndustrySubCategoryPage =
  {
    kind: 'subCategory',
    slug: 'student-recruitment-agencies',
    parentSlug: 'education',
    status: 'draft',
    name: msg`Student recruitment agencies`,
    meta: {
      title: msg`Twenty for student recruitment agencies — offers, partners and commissions`,
      description: msg`Track offer letters, partner agents and provider commissions in an open source CRM. See an example student recruitment agency workspace built on Twenty.`,
    },
    hero: {
      headline: msg`From enquiry to enrolment, *across every provider*`,
      body: msg`Offer letters, partner agents and the commission each provider owes you, on the same records as your students. Here is an example recruitment agency workspace built on Twenty.`,
    },
    preview: {
      workspaceName: 'Tidewater Student Advisors',
      tableObjectId: 'offerLetter',
      viewName: 'Open offers',
      columns: [
        { id: 'name', label: 'Student', width: 170, isFirstColumn: true },
        { id: 'provider', label: 'Provider', width: 200 },
        { id: 'course', label: 'Course', width: 190 },
        { id: 'acceptBy', label: 'Accept by', width: 120 },
        { id: 'status', label: 'Status', width: 140 },
      ],
      rows: [
        offerLetterRow(
          'priya',
          'Priya Nair',
          'Kingsbridge University',
          'Master of Data Science',
          'Nov 28',
          { value: 'Conditional', color: 'amber' },
        ),
        offerLetterRow(
          'omar',
          'Omar Farouk',
          'Bayview Polytechnic',
          'Diploma of Engineering',
          'Dec 4',
          { value: 'Unconditional', color: 'blue' },
        ),
        offerLetterRow(
          'ana',
          'Ana Ribeiro',
          'Kingsbridge University',
          'Bachelor of Nursing',
          'Dec 9',
          { value: 'Accepted', color: 'green' },
        ),
        offerLetterRow(
          'jaewon',
          'Jae-won Park',
          'Millbrook College of Business',
          'Graduate Certificate in Marketing',
          'Nov 30',
          { value: 'Awaiting student', color: 'gray' },
        ),
        offerLetterRow(
          'thandiwe',
          'Thandiwe Dube',
          'Coral Coast Institute',
          'Certificate IV in Hospitality',
          'Nov 26',
          { value: 'Expiring', color: 'red' },
        ),
      ],
      record: {
        name: 'Kingsbridge University',
        createdAt: 'Added Mar 3',
        fields: [
          {
            label: 'Type',
            value: { type: 'select', color: 'purple', value: 'University' },
          },
          { label: 'Commission rate', value: { type: 'text', value: '15%' } },
          {
            label: 'Next census date',
            value: { type: 'text', value: 'Mar 16' },
          },
          {
            label: 'Relationship manager',
            value: { type: 'person', name: 'Hamish Doyle', kind: 'person' },
          },
        ],
      },
    },
    pains: [
      {
        complaint: msg`Commission claims slip past the census date.`,
        answer: msg`A daily workflow opens a commission claim as soon as a student passes census.`,
        answeredBy: 'workflows',
      },
      {
        complaint: msg`Sub-agents send us students by email.`,
        answer: msg`Partner agents are records, and every student they refer is linked to them with their commission split.`,
        answeredBy: 'dataModel',
      },
      {
        complaint: msg`Nobody knows what each provider owes us.`,
        answer: msg`Each provider shows its claimed, paid and overdue commissions on one tab.`,
        answeredBy: 'customScreen',
      },
      {
        complaint: msg`Our vendor shut down and left us a CSV.`,
        answer: msg`AC&T Education Migration rebuilt from that CSV on self-hosted Twenty, with a nightly workflow keeping enrolments current.`,
        answeredBy: 'proof',
      },
    ],
    addedObjects: [
      {
        id: 'offerLetter',
        label: msg`Offer letters`,
        purpose: msg`A provider's offer on an application, with its conditions and acceptance deadline.`,
        fields: [
          { label: msg`Conditions` },
          { label: msg`Accept by` },
          { label: msg`Application`, relatesTo: 'application' },
        ],
        previewIcon: 'notes',
        previewTone: 'orange',
      },
      {
        id: 'commission',
        label: msg`Provider commissions`,
        purpose: msg`What a provider owes you for one enrolment, from census date to payment.`,
        fields: [
          { label: msg`Amount` },
          { label: msg`Due on` },
          { label: msg`Provider`, relatesTo: 'company' },
          { label: msg`Enrolment`, relatesTo: 'enrolment' },
        ],
        previewIcon: 'coins',
        previewTone: 'green',
      },
      {
        id: 'partnerAgent',
        label: msg`Partner agents`,
        purpose: msg`A sub-agent who refers students to you, with their country and commission split.`,
        fields: [
          { label: msg`Country` },
          { label: msg`Commission split` },
          { label: msg`Students`, relatesTo: 'student' },
        ],
        previewIcon: 'briefcase',
        previewTone: 'pink',
      },
    ],
    workflows: [
      {
        title: msg`Offer letter to visa checklist`,
        outcome: msg`A student hears about their offer the day it arrives, with a visa checklist ready.`,
        steps: [
          { kind: 'trigger', label: msg`Offer letter is created` },
          { kind: 'action', label: msg`Email the student their offer` },
          { kind: 'action', label: msg`Create the visa document checklist` },
          {
            kind: 'action',
            label: msg`Create a task to review the conditions`,
          },
        ],
      },
      {
        title: msg`Commission claim after census`,
        outcome: msg`Every enrolment past its census date becomes a commission claim on its provider.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 07:00` },
          {
            kind: 'action',
            label: msg`Find enrolments that passed census yesterday`,
          },
          { kind: 'action', label: msg`Create a commission marked due` },
          { kind: 'action', label: msg`Create a task to invoice the provider` },
        ],
      },
      {
        title: msg`Partner agent referral`,
        outcome: msg`A sub-agent's referral lands as a student, linked to them, within seconds.`,
        steps: [
          { kind: 'trigger', label: msg`Referral form calls a webhook` },
          { kind: 'action', label: msg`Find the partner agent by code` },
          { kind: 'action', label: msg`Create or update the student` },
          { kind: 'action', label: msg`Link the student to the partner agent` },
          { kind: 'action', label: msg`Email the partner agent a receipt` },
        ],
      },
    ],
    customScreen: {
      title: msg`Commission tracker`,
      placedOn: 'company',
      description: msg`Every commission a provider owes you, from census date to payment.`,
      preview: {
        tabLabel: 'Commissions',
        title: 'Commission tracker',
        caption: 'Semester 1 intake',
        columns: ['Student', 'Census date', 'Commission', 'Status'],
        rows: [
          {
            id: 'ana',
            cells: [
              { type: 'text', value: 'Ana Ribeiro' },
              { type: 'text', value: 'Mar 16' },
              { type: 'currency', value: '$4,350' },
              { type: 'select', color: 'blue', value: 'Due' },
            ],
          },
          {
            id: 'farid',
            highlighted: true,
            cells: [
              { type: 'text', value: 'Farid Rahimi' },
              { type: 'text', value: 'Aug 11' },
              { type: 'currency', value: '$3,900' },
              { type: 'select', color: 'red', value: 'Overdue' },
            ],
          },
          {
            id: 'lucia',
            cells: [
              { type: 'text', value: 'Lucia Moreno' },
              { type: 'text', value: 'Aug 11' },
              { type: 'currency', value: '$5,100' },
              { type: 'select', color: 'amber', value: 'Claimed' },
            ],
          },
          {
            id: 'tariq',
            cells: [
              { type: 'text', value: 'Tariq Aziz' },
              { type: 'text', value: 'Mar 18' },
              { type: 'currency', value: '$4,350' },
              { type: 'select', color: 'green', value: 'Paid' },
            ],
          },
        ],
        footnote: 'Farid Rahimi is 90 days past census with no payment.',
      },
    },
    questions: [
      {
        question: msg`Can sub-agents see the students they refer?`,
        answer: msg`Yes. Partner agents get a role with row-level rules, so each sees only their own referrals.`,
      },
      {
        question: msg`Which CRMs did AC&T compare?`,
        answer: msg`AC&T Education Migration evaluated Salesforce, Zoho, Pipedrive and SuiteCRM. It chose Twenty, self-hosted and set up by Flycoder.`,
      },
    ],
  };
