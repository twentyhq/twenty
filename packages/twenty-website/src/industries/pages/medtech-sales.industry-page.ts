import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE } from './healthcare-life-sciences.industry-page';

const placementRow = (
  id: string,
  device: string,
  facility: string,
  status: { value: string; color: 'amber' | 'green' | 'red' | 'gray' },
  serviceDue: string,
  engineer: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: device, shortLabel: device[0], tone: 'teal' },
    facility: { type: 'entity', name: facility },
    status: { type: 'select', ...status },
    serviceDue: { type: 'text', value: serviceDue },
    engineer: { type: 'person', name: engineer, kind: 'person', tone: 'gray' },
  },
});

export const MEDTECH_SALES_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'medtech-sales',
  parentSlug: 'healthcare-life-sciences',
  status: 'draft',
  name: msg`Medtech sales`,
  meta: {
    title: msg`Twenty for medtech sales — track placements, tenders and service contracts`,
    description: msg`Track installed devices, tenders and service contracts by hospital in an open source CRM. See an example medtech workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every placement and renewal, *hospital by hospital*`,
    body: msg`Installed devices, tenders and service contracts, tied to the facilities that use them. Here is an example medtech workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Hollis Surgical Systems',
    tableObjectId: 'placement',
    viewName: 'Installed base',
    columns: [
      { id: 'name', label: 'Device', width: 200, isFirstColumn: true },
      { id: 'facility', label: 'Facility', width: 200 },
      { id: 'status', label: 'Status', width: 130 },
      { id: 'serviceDue', label: 'Service due', width: 130 },
      { id: 'engineer', label: 'Field engineer', width: 160 },
    ],
    rows: [
      placementRow(
        'hx-4410',
        'HX-400 imaging tower SN 4410',
        'Ostmere University Hospital',
        { value: 'In service', color: 'green' },
        'In 12 days',
        'Rafael Duarte',
      ),
      placementRow(
        'hx-3982',
        'HX-400 imaging tower SN 3982',
        'Larkfield General Hospital',
        { value: 'Service overdue', color: 'red' },
        '6 days ago',
        'Mei Takahashi',
      ),
      placementRow(
        'ls-0217',
        'Lumen S2 light SN 0217',
        'Calder Bay Medical Center',
        { value: 'In service', color: 'green' },
        'Feb 3, 2027',
        'Rafael Duarte',
      ),
      placementRow(
        'ls-0388',
        'Lumen S2 light SN 0388',
        'Brennick Surgical Center',
        { value: 'On trial', color: 'amber' },
        'Jan 20, 2027',
        'Mei Takahashi',
      ),
      placementRow(
        'hx-2105',
        'HX-300 imaging tower SN 2105',
        'Sablewood Regional Hospital',
        { value: 'End of life', color: 'gray' },
        'None',
        'Rafael Duarte',
      ),
    ],
    record: {
      name: 'Ostmere University Hospital',
      createdAt: 'Added Mar 8',
      fields: [
        {
          label: 'Type',
          value: {
            type: 'select',
            color: 'blue',
            value: 'University hospital',
          },
        },
        { label: 'Beds', value: { type: 'text', value: '1,120' } },
        { label: 'Territory', value: { type: 'text', value: 'Central' } },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Ines Moreau', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'placement',
      label: msg`Placements`,
      purpose: msg`One installed device at one facility, with its serial number and service dates.`,
      fields: [
        { label: msg`Serial number` },
        { label: msg`Next service` },
        { label: msg`Department`, relatesTo: 'department' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'teal',
    },
    {
      id: 'tender',
      label: msg`Tenders`,
      purpose: msg`A published call for bids, with a deadline and the deal it becomes.`,
      fields: [
        { label: msg`Deadline` },
        { label: msg`Lots` },
        { label: msg`Deal`, relatesTo: 'deal' },
      ],
      previewIcon: 'briefcase',
      previewTone: 'orange',
    },
    {
      id: 'serviceContract',
      label: msg`Service contracts`,
      purpose: msg`Maintenance cover on placed devices, with its own renewal date.`,
      fields: [
        { label: msg`Coverage` },
        { label: msg`Ends on` },
        { label: msg`Placements`, relatesTo: 'placement' },
      ],
      previewIcon: 'shieldCheck',
      previewTone: 'pink',
    },
  ],
  workflows: [
    {
      title: msg`Tender deadline countdown`,
      outcome: msg`No bid misses its deadline because nobody checked the date.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find tenders due within 14 days` },
        { kind: 'agent', label: msg`List what the bid still needs` },
        { kind: 'action', label: msg`Email the bid owner` },
      ],
    },
    {
      title: msg`Placement service due`,
      outcome: msg`Field engineers see every service visit a month ahead.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 07:00` },
        {
          kind: 'action',
          label: msg`Find placements due for service in 30 days`,
        },
        { kind: 'action', label: msg`Create a task for the field engineer` },
      ],
    },
    HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE.workflows.items[0],
  ],
  customScreen: {
    title: msg`Installed base`,
    placedOn: 'facility',
    description: msg`Every device placed at a facility, by department, with its service status.`,
    preview: {
      tabLabel: 'Installed base',
      title: 'Installed base',
      caption: '4 devices in 3 departments',
      columns: ['Device', 'Department', 'Installed', 'Service due'],
      rows: [
        {
          id: 'hx-4410',
          highlighted: true,
          cells: [
            { type: 'text', value: 'HX-400 SN 4410' },
            { type: 'text', value: 'Interventional radiology' },
            { type: 'text', value: 'May 2022' },
            { type: 'select', color: 'amber', value: 'In 12 days' },
          ],
        },
        {
          id: 'hx-4417',
          cells: [
            { type: 'text', value: 'HX-400 SN 4417' },
            { type: 'text', value: 'Cardiology' },
            { type: 'text', value: 'May 2022' },
            { type: 'select', color: 'green', value: 'Apr 2027' },
          ],
        },
        {
          id: 'ls-0302',
          cells: [
            { type: 'text', value: 'Lumen S2 SN 0302' },
            { type: 'text', value: 'Operating theatres' },
            { type: 'text', value: 'Oct 2023' },
            { type: 'select', color: 'green', value: 'Jun 2027' },
          ],
        },
        {
          id: 'ls-0303',
          cells: [
            { type: 'text', value: 'Lumen S2 SN 0303' },
            { type: 'text', value: 'Operating theatres' },
            { type: 'text', value: 'Oct 2023' },
            { type: 'select', color: 'green', value: 'Jun 2027' },
          ],
        },
      ],
      footnote: 'Tower SN 4410 needs its service visit booked this week.',
    },
  },
  questions: [
    {
      question: msg`Can field engineers work in the same CRM?`,
      answer: msg`Yes. Give them a role that sees placements and service tasks, without deal values or pricing.`,
    },
    {
      question: msg`Tenders come from several portals.`,
      answer: msg`Each source posts to a webhook or the API, and the same workflow creates the tender and the deal.`,
    },
  ],
};
