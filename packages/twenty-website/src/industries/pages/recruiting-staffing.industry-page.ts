import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const roleRow = (
  id: string,
  name: string,
  client: string,
  stage: {
    value: string;
    color: 'amber' | 'green' | 'blue' | 'purple' | 'gray';
  },
  submissions: string,
  recruiter: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    client: { type: 'entity', name: client },
    stage: { type: 'select', ...stage },
    submissions: { type: 'number', value: submissions },
    recruiter: {
      type: 'person',
      name: recruiter,
      kind: 'person',
      tone: 'gray',
    },
  },
});

export const RECRUITING_STAFFING_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'recruiting-staffing',
  parentSlug: 'professional-services',
  status: 'draft',
  name: msg`Recruiting and staffing`,
  meta: {
    title: msg`Twenty for recruiting and staffing agencies`,
    description: msg`Track candidates, roles, submissions and placements on one two-sided pipeline in an open source CRM. See an example agency workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Candidates against roles, *roles against clients*`,
    body: msg`Candidates, roles, submissions and placements on one two-sided pipeline. Here is an example staffing agency workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Brackenridge Talent',
    tableObjectId: 'role',
    viewName: 'Open roles',
    columns: [
      { id: 'name', label: 'Role', width: 200, isFirstColumn: true },
      { id: 'client', label: 'Client', width: 160 },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'submissions', label: 'Submissions', width: 120, align: 'right' },
      { id: 'recruiter', label: 'Recruiter', width: 160 },
    ],
    rows: [
      roleRow(
        'data-engineer',
        'Senior data engineer',
        'Vantor Freight',
        { value: 'Shortlisting', color: 'amber' },
        '4',
        'Priya Raman',
      ),
      roleRow(
        'head-of-finance',
        'Head of finance',
        'Lumen Dental Group',
        { value: 'Interviewing', color: 'blue' },
        '3',
        'Tomás Ribeiro',
      ),
      roleRow(
        'reliability-lead',
        'Site reliability lead',
        'Quillfield Software',
        { value: 'Offer', color: 'green' },
        '2',
        'Priya Raman',
      ),
      roleRow(
        'payroll-specialist',
        'Payroll specialist',
        'Arden Home Care',
        { value: 'Open', color: 'purple' },
        '0',
        'Elena Novak',
      ),
      roleRow(
        'plant-manager',
        'Plant manager',
        'Corrin Metals',
        { value: 'Filled', color: 'gray' },
        '5',
        'Elena Novak',
      ),
    ],
    record: {
      name: 'Senior data engineer',
      createdAt: 'Added Nov 3',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Shortlisting' },
        },
        { label: 'Client', value: { type: 'text', value: 'Vantor Freight' } },
        { label: 'Fee', value: { type: 'currency', value: '$28,500' } },
        {
          label: 'Target start',
          value: { type: 'text', value: 'Jan 18, 2027' },
        },
        {
          label: 'Recruiter',
          value: { type: 'person', name: 'Priya Raman', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our candidate database and our client CRM never agree.`,
      answer: msg`Candidates, roles and clients live in one workspace, so both sides of the pipeline match.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Submissions go quiet and nobody chases the client.`,
      answer: msg`A daily workflow finds submissions with no feedback after five days and creates a chase task.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Clients ask why we put a candidate forward.`,
      answer: msg`A shortlist score on each role shows how every candidate meets the must-haves.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Recruiters worry colleagues will work their candidates.`,
      answer: msg`Row-level rules let each recruiter edit only the candidates they own.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'candidate',
      label: msg`Candidates`,
      purpose: msg`A person the agency represents, with availability, expectations and an owner.`,
      fields: [
        { label: msg`Person`, relatesTo: 'person' },
        { label: msg`Availability` },
        { label: msg`Salary expectation` },
        { label: msg`Owning recruiter` },
      ],
      previewIcon: 'user',
      previewTone: 'pink',
    },
    {
      id: 'role',
      label: msg`Roles`,
      purpose: msg`A job order from a client, with a brief, a fee and a target start.`,
      fields: [
        { label: msg`Client`, relatesTo: 'company' },
        { label: msg`Hiring manager`, relatesTo: 'person' },
        { label: msg`Must-haves` },
        { label: msg`Fee` },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'orange',
    },
    {
      id: 'submission',
      label: msg`Submissions`,
      purpose: msg`One candidate put forward for one role, with the client's feedback.`,
      fields: [
        { label: msg`Submitted on` },
        { label: msg`Client feedback` },
        { label: msg`Candidate`, relatesTo: 'candidate' },
        { label: msg`Role`, relatesTo: 'role' },
      ],
      previewIcon: 'notes',
      previewTone: 'purple',
    },
    {
      id: 'placement',
      label: msg`Placements`,
      purpose: msg`A candidate who started, with the fee and the end of the guarantee period.`,
      fields: [
        { label: msg`Start date` },
        { label: msg`Guarantee ends on` },
        { label: msg`Fee` },
        { label: msg`Submission`, relatesTo: 'submission' },
      ],
      previewIcon: 'shieldCheck',
      previewTone: 'green',
    },
  ],
  omittedObjectIds: [
    'proposal',
    'engagement',
    'consultant',
    'assignment',
    'rateCard',
  ],
  modelNotes: [
    {
      title: msg`A candidate is a person`,
      body: msg`The candidate record extends the person, so their emails and meetings sit on one timeline.`,
    },
    {
      title: msg`Submissions join candidates to roles`,
      body: msg`Each submission keeps its own stage, so one candidate can be in three processes at once.`,
    },
    {
      title: msg`A placement closes the loop`,
      body: msg`Fee, start date and guarantee period live on the placement, so invoicing and follow-ups run from it.`,
    },
  ],
  workflows: [
    {
      title: msg`Candidate placed`,
      outcome: msg`Every placement counts down its guarantee and gets a check-in before it ends.`,
      steps: [
        { kind: 'trigger', label: msg`Submission stage is set to Placed` },
        { kind: 'action', label: msg`Create the placement` },
        {
          kind: 'action',
          label: msg`Set the guarantee to end 90 days after the start date`,
        },
        { kind: 'action', label: msg`Wait until a week before it ends` },
        {
          kind: 'action',
          label: msg`Create a check-in task for the recruiter`,
        },
      ],
    },
    {
      title: msg`Role opened`,
      outcome: msg`A new role starts with a ranked shortlist from candidates the agency already knows.`,
      steps: [
        { kind: 'trigger', label: msg`A role is created` },
        {
          kind: 'agent',
          label: msg`Shortlist agent ranks candidates against the must-haves`,
        },
        { kind: 'action', label: msg`Create a review task for the recruiter` },
      ],
    },
    {
      title: msg`Client feedback chase`,
      outcome: msg`No submission waits more than five days without a nudge.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 09:00` },
        {
          kind: 'action',
          label: msg`Find submissions with no client feedback after 5 days`,
        },
        { kind: 'action', label: msg`Create a chase task for the recruiter` },
      ],
    },
  ],
  customScreen: {
    title: msg`Shortlist scoring`,
    placedOn: 'role',
    description: msg`Scores each candidate on the role against its must-haves, so the recruiter submits the strongest first.`,
    preview: {
      tabLabel: 'Shortlist',
      title: 'Shortlist scoring',
      caption: 'Candidates against the role must-haves',
      columns: ['Candidate', 'Must-haves', 'Score', 'Status'],
      rows: [
        {
          id: 'joel',
          highlighted: true,
          cells: [
            { type: 'person', name: 'Joel Ashworth', kind: 'person' },
            { type: 'text', value: '5 of 5' },
            { type: 'select', color: 'green', value: '92' },
            { type: 'select', color: 'blue', value: 'Submitted' },
          ],
        },
        {
          id: 'mira',
          cells: [
            { type: 'person', name: 'Mira Delacroix', kind: 'person' },
            { type: 'text', value: '4 of 5' },
            { type: 'select', color: 'green', value: '81' },
            { type: 'select', color: 'amber', value: 'To call' },
          ],
        },
        {
          id: 'farid',
          cells: [
            { type: 'person', name: 'Farid Haddad', kind: 'person' },
            { type: 'text', value: '3 of 5' },
            { type: 'select', color: 'amber', value: '64' },
            { type: 'select', color: 'gray', value: 'Hold' },
          ],
        },
      ],
      footnote: 'Mira is free from January and meets four must-haves.',
    },
  },
  agents: {
    heading: msg`Agents that read the bench. *Recruiters make the call*`,
    items: [
      {
        name: msg`Shortlist agent`,
        job: msg`Ranks existing candidates against a new role's must-haves and notes why each one fits.`,
        reads: ['role', 'candidate', 'submission', 'person', 'note'],
        writes: ['note', 'task'],
        limit: msg`Cannot submit candidates or contact clients.`,
      },
      {
        name: msg`Candidate summary writer`,
        job: msg`Turns a recruiter's interview notes into a short summary for the client.`,
        reads: ['candidate', 'role', 'note'],
        writes: ['note'],
        limit: msg`Drafts only. The recruiter edits and sends.`,
      },
    ],
  },
  access: {
    heading: msg`Recruiters own their candidates. *Directors see the whole desk*`,
    roles: [
      { id: 'recruiter', label: msg`Recruiter` },
      { id: 'accountManager', label: msg`Account manager` },
      { id: 'director', label: msg`Director` },
    ],
    rules: [
      {
        objectId: 'candidate',
        accessByRoleId: {
          recruiter: msg`See all, edit their own`,
          accountManager: msg`See all, no salary`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'role',
        accessByRoleId: {
          recruiter: msg`See all, edit assigned`,
          accountManager: msg`See and edit their clients`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'placement',
        accessByRoleId: {
          recruiter: msg`Their own, no fees`,
          accountManager: msg`Their clients`,
          director: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'role' },
      { salesforceObject: 'Placement (custom)', objectId: 'placement' },
    ],
    note: msg`Each candidate links to the person imported from their Contact. Import by CSV or through the API.`,
  },
  discovery: [
    {
      question: msg`Do you place permanent hires, contractors or both?`,
      shapes: msg`Decides the fields on roles and placements.`,
    },
    {
      question: msg`How many open roles does each recruiter carry?`,
      shapes: msg`Sets the views and how recruiters split the work.`,
    },
    {
      question: msg`Where does your candidate database live today?`,
      shapes: msg`Decides the first import and how candidates link to people.`,
    },
    {
      question: msg`How long is your guarantee period?`,
      shapes: msg`Sets the countdown in the placement workflow.`,
    },
    {
      question: msg`Who owns a client, and who owns a candidate?`,
      shapes: msg`Sets the recruiter and account manager roles.`,
    },
  ],
  questions: [
    {
      question: msg`Can we bring our candidate database?`,
      answer: msg`Yes. Import candidates by CSV or through the API, and link each one to a person record.`,
    },
    {
      question: msg`A candidate later becomes a hiring manager. Is that two records?`,
      answer: msg`No. Both link to the same person, so the history follows them from one side of the pipeline to the other.`,
    },
  ],
  proof: { kind: 'none' },
};
