import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const dealRow = (
  id: string,
  name: string,
  facility: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
  value: string,
  rep: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    facility: { type: 'entity', name: facility },
    stage: { type: 'select', ...stage },
    value: { type: 'currency', value },
    rep: { type: 'person', name: rep, kind: 'person', tone: 'gray' },
  },
});

export const HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'healthcare-life-sciences',
  status: 'draft',
  name: msg`Healthcare and life sciences`,
  meta: {
    title: msg`Twenty for healthcare and life sciences sales — a CRM built around facilities and buying committees`,
    description: msg`Model facilities, buying committees, contracts and visits in an open source CRM you can host yourself. See an example workspace for a team selling to hospitals.`,
  },
  hero: {
    headline: msg`Every hospital, every buying committee, *every contract*`,
    body: msg`Facilities, stakeholders, contracts and visits, not contacts and deals. Here is an example workspace for a team selling to hospitals, built on Twenty.`,
  },
  preview: {
    workspaceName: 'Corvane Medical',
    tableObjectId: 'deal',
    viewName: 'Open deals',
    columns: [
      { id: 'name', label: 'Deal', width: 200, isFirstColumn: true },
      { id: 'facility', label: 'Facility', width: 200 },
      { id: 'stage', label: 'Stage', width: 140 },
      { id: 'value', label: 'Value', width: 120, align: 'right' },
      { id: 'rep', label: 'Rep', width: 150 },
    ],
    rows: [
      dealRow(
        'larkfield-monitors',
        'Patient monitors, ICU',
        'Larkfield General Hospital',
        { value: 'Committee review', color: 'amber' },
        '$480,000',
        'Nadia Brenner',
      ),
      dealRow(
        'calder-renewal',
        'Infusion pumps renewal',
        'Calder Bay Medical Center',
        { value: 'Negotiation', color: 'purple' },
        '$310,000',
        'Owen Achterberg',
      ),
      dealRow(
        'ostmere-trial',
        'Surgical lights trial',
        'Ostmere University Hospital',
        { value: 'Evaluation', color: 'blue' },
        '$125,000',
        'Nadia Brenner',
      ),
      dealRow(
        'thornvale-ultrasound',
        'Ultrasound fleet',
        'Thornvale Clinic Group',
        { value: 'Evaluation', color: 'blue' },
        '$220,000',
        'Ines Moreau',
      ),
      dealRow(
        'sablewood-beds',
        'Smart beds, wards 3 to 5',
        'Sablewood Regional Hospital',
        { value: 'Won', color: 'green' },
        '$640,000',
        'Owen Achterberg',
      ),
    ],
    record: {
      name: 'Larkfield General Hospital',
      createdAt: 'Added Jan 14',
      fields: [
        {
          label: 'Type',
          value: { type: 'select', color: 'blue', value: 'Teaching hospital' },
        },
        { label: 'Beds', value: { type: 'text', value: '640' } },
        { label: 'Territory', value: { type: 'text', value: 'North East' } },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Nadia Brenner', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`A hospital deal has twelve stakeholders and our CRM shows one.`,
      answer: msg`The buying committee screen shows every stakeholder by role, with their stance and last contact.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Contract renewals come round every few years and we miss them.`,
      answer: msg`A daily workflow opens a renewal deal 180 days before a contract ends.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Reps log visits late or never.`,
      answer: msg`Calendar sync records the visit, and a short form reaches the rep right after it.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Our data can't leave our infrastructure.`,
      answer: msg`Host Twenty on your own servers, and keep patient data out of the CRM entirely.`,
      answeredBy: 'switching',
    },
  ],
  dataModel: {
    heading: msg`Model accounts *the way hospitals buy*`,
    objects: [
      {
        id: 'facility',
        label: msg`Facilities`,
        purpose: msg`A hospital, clinic or practice you sell to. Or use companies.`,
        fields: [
          { label: msg`Type` },
          { label: msg`Beds` },
          { label: msg`Territory` },
        ],
        previewIcon: 'buildingSkyscraper',
        previewTone: 'blue',
      },
      {
        id: 'department',
        label: msg`Departments`,
        purpose: msg`Where the product is used and the budget sits.`,
        fields: [
          { label: msg`Specialty` },
          { label: msg`Budget holder`, relatesTo: 'stakeholder' },
          { label: msg`Facility`, relatesTo: 'facility' },
        ],
        previewIcon: 'folder',
        previewTone: 'teal',
      },
      {
        id: 'stakeholder',
        label: msg`Stakeholders`,
        purpose: msg`A person on a buying committee, with the role they play in it.`,
        fields: [
          { label: msg`Committee role` },
          { label: msg`Stance` },
          { label: msg`Person`, relatesTo: 'person' },
          { label: msg`Facility`, relatesTo: 'facility' },
        ],
        previewIcon: 'users',
        previewTone: 'purple',
      },
      {
        id: 'deal',
        label: msg`Deals`,
        purpose: msg`One purchase decision at one facility, from first visit to signature.`,
        fields: [
          { label: msg`Value` },
          { label: msg`Stage` },
          { label: msg`Facility`, relatesTo: 'facility' },
        ],
        previewIcon: 'targetArrow',
        previewTone: 'amber',
      },
      {
        id: 'contract',
        label: msg`Contracts`,
        purpose: msg`What was signed, with pricing, terms and an end date.`,
        fields: [
          { label: msg`Ends on` },
          { label: msg`Pricing terms` },
          { label: msg`Deal`, relatesTo: 'deal' },
        ],
        previewIcon: 'fileText',
        previewTone: 'gray',
      },
      {
        id: 'visit',
        label: msg`Visits`,
        purpose: msg`A rep at a facility on a date, with who they met and what comes next.`,
        fields: [
          { label: msg`Date` },
          { label: msg`Next step` },
          { label: msg`Stakeholders met`, relatesTo: 'stakeholder' },
          { label: msg`Facility`, relatesTo: 'facility' },
        ],
        previewIcon: 'calendarEvent',
        previewTone: 'green',
      },
    ],
    notes: [
      {
        title: msg`A stakeholder is a role, not a contact`,
        body: msg`The same surgeon can be a clinical champion on one deal and absent from the next.`,
      },
      {
        title: msg`Contracts outlive deals`,
        body: msg`A signed contract keeps its end date, so the renewal starts years later on time.`,
      },
      {
        title: msg`No patient object`,
        body: msg`This model holds facilities, people and deals. Patient records stay in clinical systems.`,
      },
    ],
  },
  workflows: {
    heading: msg`Long cycles, run on dates. *Reps keep the relationships*`,
    items: [
      {
        title: msg`Contract renewal`,
        outcome: msg`Every renewal opens six months before the contract ends.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 07:00` },
          { kind: 'action', label: msg`Find contracts ending in 180 days` },
          { kind: 'action', label: msg`Create a renewal deal` },
          { kind: 'agent', label: msg`Write a renewal brief for the rep` },
        ],
      },
      {
        title: msg`Visit follow-up`,
        outcome: msg`Every visit is logged the same day, with a next step.`,
        steps: [
          { kind: 'trigger', label: msg`Visit is marked done` },
          { kind: 'action', label: msg`Send the rep a short form` },
          { kind: 'action', label: msg`Update the visit and stakeholders` },
          { kind: 'action', label: msg`Create a task for the next step` },
        ],
      },
      {
        title: msg`New tender found`,
        outcome: msg`A tender reaches the right territory the day it is published.`,
        steps: [
          { kind: 'trigger', label: msg`Webhook from a tender feed` },
          { kind: 'action', label: msg`Find the facility and its territory` },
          { kind: 'action', label: msg`Create a deal and assign the rep` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that prepare the visit. *Reps run it*`,
    items: [
      {
        name: msg`Account planner`,
        job: msg`Before a visit, summarizes the facility's history, open contracts and stakeholders in a note.`,
        reads: ['facility', 'stakeholder', 'deal', 'contract', 'visit'],
        writes: ['note'],
        limit: msg`Cannot read contract pricing or terms.`,
      },
    ],
  },
  customScreen: {
    title: msg`Buying committee`,
    placedOn: 'facility',
    description: msg`Every stakeholder by role, with their stance and when someone last spoke to them.`,
    preview: {
      tabLabel: 'Committee',
      title: 'Buying committee',
      caption: 'Patient monitors, ICU',
      columns: ['Stakeholder', 'Role', 'Stance', 'Last contact'],
      rows: [
        {
          id: 'okonjo',
          cells: [
            { type: 'person', name: 'Dr. Femi Okonjo', kind: 'person' },
            { type: 'select', color: 'blue', value: 'Clinical' },
            { type: 'select', color: 'green', value: 'Champion' },
            { type: 'text', value: '3 days ago' },
          ],
        },
        {
          id: 'lindqvist',
          highlighted: true,
          cells: [
            { type: 'person', name: 'Karin Lindqvist', kind: 'person' },
            { type: 'select', color: 'purple', value: 'Procurement' },
            { type: 'select', color: 'amber', value: 'Neutral' },
            { type: 'text', value: '47 days ago' },
          ],
        },
        {
          id: 'mercer',
          cells: [
            { type: 'person', name: 'Paul Mercer', kind: 'person' },
            { type: 'select', color: 'gray', value: 'Finance' },
            { type: 'select', color: 'red', value: 'Skeptical' },
            { type: 'text', value: '12 days ago' },
          ],
        },
        {
          id: 'ruiz',
          cells: [
            { type: 'person', name: 'Ana Ruiz', kind: 'person' },
            { type: 'select', color: 'blue', value: 'Clinical' },
            { type: 'select', color: 'green', value: 'Supportive' },
            { type: 'text', value: '9 days ago' },
          ],
        },
      ],
      footnote: 'Nobody has spoken to procurement in seven weeks.',
    },
  },
  access: {
    heading: msg`Reps see their territory. *Contract terms stay with contracts*`,
    roles: [
      { id: 'rep', label: msg`Rep` },
      { id: 'manager', label: msg`Manager` },
      { id: 'contracts', label: msg`Contracts team` },
    ],
    rules: [
      {
        objectId: 'facility',
        accessByRoleId: {
          rep: msg`Own territory`,
          manager: msg`See and edit all`,
          contracts: msg`See all`,
        },
      },
      {
        objectId: 'deal',
        accessByRoleId: {
          rep: msg`Own territory, no pricing`,
          manager: msg`See and edit all`,
          contracts: msg`See all`,
        },
      },
      {
        objectId: 'contract',
        accessByRoleId: {
          rep: msg`End dates only`,
          manager: msg`See all`,
          contracts: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Health Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'facility' },
      { salesforceObject: 'Contact', objectId: 'stakeholder' },
      { salesforceObject: 'Opportunity', objectId: 'deal' },
      { salesforceObject: 'Contract', objectId: 'contract' },
    ],
    note: msg`Patient objects stay out of scope. Import the rest by CSV or API, into our cloud or your own servers.`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Is Twenty HIPAA compliant?`,
      answer: msg`[placeholder: confirm position before launch]`,
    },
    {
      question: msg`Can we keep patient data out of the CRM?`,
      answer: msg`Yes. Model only facilities, people and deals, and patient records never enter Twenty.`,
    },
    {
      question: msg`Our data must stay on our infrastructure.`,
      answer: msg`Twenty is open source and can be hosted on your own servers. Air-gapped deployment is on the Enterprise plan.`,
    },
    {
      question: msg`Our hospitals buy through tenders.`,
      answer: msg`Tenders arrive by webhook or API and become deals, assigned to the right territory.`,
    },
  ],
  discovery: [
    {
      question: msg`Do you sell to facilities or treat patients?`,
      shapes: msg`This page fits teams that sell. Patient care is a different model.`,
    },
    {
      question: msg`How many stakeholders sign a deal?`,
      shapes: msg`Sets the committee roles on the buying committee screen.`,
    },
    {
      question: msg`How long is your sales cycle?`,
      shapes: msg`Sets the renewal lead time and the deal stages.`,
    },
    {
      question: msg`Where must your data live?`,
      shapes: msg`Decides between our cloud and self-hosting.`,
    },
    {
      question: msg`Who handles tenders?`,
      shapes: msg`Sets who the tender workflow assigns, and who sees pricing.`,
    },
  ],
};
