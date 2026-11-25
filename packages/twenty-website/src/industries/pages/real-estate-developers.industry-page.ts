import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const reservationRow = (
  id: string,
  unit: string,
  buyer: string,
  phase: string,
  depositDue: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'red' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: unit, shortLabel: unit[0], tone: 'amber' },
    buyer: { type: 'person', name: buyer, kind: 'person', tone: 'gray' },
    phase: { type: 'text', value: phase },
    depositDue: { type: 'text', value: depositDue },
    status: { type: 'select', ...status },
  },
});

export const REAL_ESTATE_DEVELOPERS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'real-estate-developers',
  parentSlug: 'real-estate',
  status: 'draft',
  name: msg`Real estate developers`,
  meta: {
    title: msg`Twenty for real estate developers — projects, phases and reservations`,
    description: msg`Track projects, phase releases, unit reservations and investors in an open source CRM. See an example developer workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Sell out the scheme *before it tops out*`,
    body: msg`Every phase release, reservation and deposit in one place, with investors kept up to date. Here is an example developer workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Stonebridge Developments',
    tableObjectId: 'unitSale',
    viewName: 'Open reservations',
    columns: [
      { id: 'name', label: 'Unit', width: 170, isFirstColumn: true },
      { id: 'buyer', label: 'Buyer', width: 160 },
      { id: 'phase', label: 'Phase', width: 120 },
      { id: 'depositDue', label: 'Deposit due', width: 130 },
      { id: 'status', label: 'Status', width: 130 },
    ],
    rows: [
      reservationRow(
        'p2-204',
        'Apartment 204',
        'Hannah Lindqvist',
        'Phase 2',
        'In 3 days',
        { value: 'Reserved', color: 'amber' },
      ),
      reservationRow(
        'p2-311',
        'Apartment 311',
        'Daniel Mensah',
        'Phase 2',
        'Overdue',
        { value: 'Deposit late', color: 'red' },
      ),
      reservationRow(
        'p2-118',
        'Apartment 118',
        'Yuki Tanaka',
        'Phase 2',
        'Paid',
        { value: 'Exchanged', color: 'green' },
      ),
      reservationRow(
        'p1-602',
        'Penthouse 602',
        'Carla Romano',
        'Phase 1',
        'Paid',
        { value: 'Exchanged', color: 'green' },
      ),
      reservationRow(
        'p2-407',
        'Apartment 407',
        'Marcus Hale',
        'Phase 2',
        'Dec 9',
        { value: 'Reserved', color: 'amber' },
      ),
      reservationRow(
        'p3-101',
        'Townhouse 1',
        'Aoife Brennan',
        'Phase 3',
        'At release',
        { value: 'Registered', color: 'blue' },
      ),
    ],
    record: {
      name: 'Kestrel Quay',
      createdAt: 'Added Mar 4',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'blue', value: 'Under construction' },
        },
        { label: 'Units', value: { type: 'text', value: '184' } },
        { label: 'Tops out', value: { type: 'text', value: 'Aug 2027' } },
        {
          label: 'Sales director',
          value: { type: 'person', name: 'Elena Moreau', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Each phase has its own sales spreadsheet.`,
      answer: msg`Project, phase and reservation are linked objects, so every unit sits in one model.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Deposits slip past their due date.`,
      answer: msg`A daily workflow reminds buyers and flags late deposits to the sales agent.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We cannot see how a release is selling.`,
      answer: msg`The project page shows reserved and exchanged units for every phase.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Investor updates take a week to assemble.`,
      answer: msg`An agent drafts each quarterly update from the sales records.`,
      answeredBy: 'agents',
    },
  ],
  addedObjects: [
    {
      id: 'project',
      label: msg`Projects`,
      purpose: msg`One scheme, from land purchase to the last handover.`,
      fields: [
        { label: msg`Site address` },
        { label: msg`Tops out on` },
        { label: msg`Investors`, relatesTo: 'company' },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'blue',
    },
    {
      id: 'phase',
      label: msg`Phases`,
      purpose: msg`A release of units, with its own price list and launch date.`,
      fields: [
        { label: msg`Release date` },
        { label: msg`Units released` },
        { label: msg`Project`, relatesTo: 'project' },
      ],
      previewIcon: 'folder',
      previewTone: 'purple',
    },
    {
      id: 'unitSale',
      label: msg`Unit sales`,
      purpose: msg`A reservation on one unit, from deposit to exchange.`,
      fields: [
        { label: msg`Price` },
        { label: msg`Deposit due` },
        { label: msg`Buyer`, relatesTo: 'person' },
        { label: msg`Phase`, relatesTo: 'phase' },
      ],
      previewIcon: 'key',
      previewTone: 'amber',
    },
  ],
  workflows: [
    {
      title: msg`Reservation deposit due`,
      outcome: msg`No reservation lapses because a deposit went unchased.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        { kind: 'action', label: msg`Find deposits due within 7 days` },
        { kind: 'action', label: msg`Email the buyer a reminder` },
        { kind: 'action', label: msg`Create a task for overdue deposits` },
      ],
    },
    {
      title: msg`Phase launch`,
      outcome: msg`Registered buyers hear about a release before the public does.`,
      steps: [
        { kind: 'trigger', label: msg`Phase is marked released` },
        { kind: 'action', label: msg`Find buyers registered on the project` },
        { kind: 'action', label: msg`Email each buyer the price list` },
      ],
    },
    {
      title: msg`Quarterly investor update`,
      outcome: msg`Investors get a sales update every quarter without a week of collation.`,
      steps: [
        { kind: 'trigger', label: msg`First day of each quarter` },
        {
          kind: 'action',
          label: msg`Find reservations and exchanges by phase`,
        },
        { kind: 'agent', label: msg`Draft the update for each investor` },
        {
          kind: 'action',
          label: msg`Create a review task for the finance director`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Sales release by phase`,
    placedOn: 'project',
    description: msg`Shows released, reserved and exchanged units for each phase of a project.`,
    preview: {
      tabLabel: 'Sales release',
      title: 'Sales release by phase',
      caption: '184 units across three phases',
      columns: ['Phase', 'Released', 'Reserved', 'Exchanged'],
      rows: [
        {
          id: 'phase-1',
          cells: [
            { type: 'text', value: 'Phase 1' },
            { type: 'number', value: '64' },
            { type: 'number', value: '64' },
            { type: 'number', value: '59' },
          ],
        },
        {
          id: 'phase-2',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Phase 2' },
            { type: 'number', value: '72' },
            { type: 'number', value: '43' },
            { type: 'number', value: '18' },
          ],
        },
        {
          id: 'phase-3',
          cells: [
            { type: 'text', value: 'Phase 3' },
            { type: 'number', value: '0' },
            { type: 'number', value: '0' },
            { type: 'number', value: '0' },
          ],
        },
      ],
      footnote: 'Phase 2 needs 11 more reservations before Phase 3 can launch.',
    },
  },
  agents: {
    heading: msg`Agents that prepare the reporting. *People sign it off*`,
    items: [
      {
        name: msg`Investor reporter`,
        job: msg`Drafts each investor's quarterly update from phase and reservation records.`,
        reads: ['project', 'phase', 'unitSale', 'company'],
        writes: ['note'],
        limit: msg`Drafts the update but cannot send it to investors.`,
      },
      {
        name: msg`Reservation desk`,
        job: msg`Checks each new reservation for missing documents and creates follow-up tasks.`,
        reads: ['unitSale', 'person', 'phase'],
        writes: ['task'],
        limit: msg`Cannot change prices or cancel a reservation.`,
      },
    ],
  },
  questions: [
    {
      question: msg`We sell through outside agencies too.`,
      answer: msg`Give each agency a role, and row-level rules show them only the reservations they brought in.`,
    },
    {
      question: msg`Can buyers reserve from our website?`,
      answer: msg`Yes. Your site can create reservations through the API or a webhook-triggered workflow.`,
    },
  ],
};
