import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { LOGISTICS_INDUSTRY_PAGE } from './logistics.industry-page';

const bookingRow = (
  id: string,
  name: string,
  shipper: string,
  route: string,
  departs: string,
  status: { value: string; color: 'blue' | 'amber' | 'red' | 'green' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: 'B', tone: 'blue' },
    shipper: { type: 'entity', name: shipper },
    route: { type: 'text', value: route },
    departs: { type: 'text', value: departs },
    status: { type: 'select', ...status },
  },
});

export const FREIGHT_FORWARDING_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'freight-forwarding',
  parentSlug: 'logistics',
  status: 'draft',
  name: msg`Freight forwarding`,
  meta: {
    title: msg`Twenty for freight forwarders — bookings, containers and customs in one CRM`,
    description: msg`Track ocean and air bookings, containers and customs files next to lanes and quotes in an open source CRM. See an example forwarder's workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every lane, quote and booking *on one record*`,
    body: msg`Ocean and air bookings, containers and customs files, linked to the quote that won them. Here is an example forwarder's workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Tidemark Forwarding',
    tableObjectId: 'booking',
    viewName: 'Sailing this month',
    columns: [
      { id: 'name', label: 'Booking', width: 140, isFirstColumn: true },
      { id: 'shipper', label: 'Shipper', width: 180 },
      { id: 'route', label: 'Route', width: 200 },
      { id: 'departs', label: 'Departs', width: 110 },
      { id: 'status', label: 'Status', width: 150 },
    ],
    rows: [
      bookingRow(
        'bk-7731',
        'BK-7731',
        'Lindqvist Furniture',
        'Gothenburg → Savannah',
        'Dec 2',
        { value: 'Customs hold', color: 'red' },
      ),
      bookingRow(
        'bk-7728',
        'BK-7728',
        'Averne Cosmetics',
        'Paris CDG → Dubai',
        'Nov 29',
        { value: 'Documents due', color: 'amber' },
      ),
      bookingRow(
        'bk-7719',
        'BK-7719',
        'Halcyon Bikes',
        'Kaohsiung → Antwerp',
        'Dec 5',
        { value: 'Confirmed', color: 'blue' },
      ),
      bookingRow(
        'bk-7702',
        'BK-7702',
        'Lindqvist Furniture',
        'Gothenburg → Houston',
        'Nov 21',
        { value: 'Sailed', color: 'green' },
      ),
    ],
    record: {
      name: 'BK-7731',
      createdAt: 'Added Nov 12',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'red', value: 'Customs hold' },
        },
        { label: 'Containers', value: { type: 'text', value: '2 × 40HC' } },
        { label: 'Incoterm', value: { type: 'text', value: 'FOB' } },
        {
          label: 'Booked by',
          value: { type: 'person', name: 'Mattias Rehn', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'booking',
      label: msg`Bookings`,
      purpose: msg`Space booked on a sailing or flight for one shipper, from the quote it won.`,
      fields: [
        { label: msg`Departs on` },
        { label: msg`Incoterm` },
        { label: msg`Quote`, relatesTo: 'rateQuote' },
        { label: msg`Carrier`, relatesTo: 'carrier' },
        { label: msg`Shipper`, relatesTo: 'company' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'blue',
    },
    {
      id: 'consignment',
      label: msg`Containers and consignments`,
      purpose: msg`One container or air consignment on a booking, with its weight and milestones.`,
      fields: [
        { label: msg`Container number` },
        { label: msg`Weight` },
        { label: msg`Booking`, relatesTo: 'booking' },
      ],
      previewIcon: 'briefcase',
      previewTone: 'orange',
    },
    {
      id: 'customsFile',
      label: msg`Customs files`,
      purpose: msg`The declaration status and documents for one booking at origin or destination.`,
      fields: [
        { label: msg`Status` },
        { label: msg`Documents received` },
        { label: msg`Booking`, relatesTo: 'booking' },
      ],
      previewIcon: 'shieldCheck',
      previewTone: 'purple',
    },
  ],
  workflows: [
    {
      title: msg`Booking confirmed`,
      outcome: msg`Customs paperwork starts the day the space is confirmed.`,
      steps: [
        { kind: 'trigger', label: msg`Booking status changes to confirmed` },
        { kind: 'action', label: msg`Create the customs file` },
        { kind: 'action', label: msg`Email the shipper the document list` },
      ],
    },
    {
      title: msg`Customs hold`,
      outcome: msg`The shipper hears about a hold before the container misses its sailing.`,
      steps: [
        { kind: 'trigger', label: msg`Customs file is set to hold` },
        { kind: 'action', label: msg`Update the booking status` },
        { kind: 'action', label: msg`Email the shipper's contact` },
        { kind: 'action', label: msg`Create a task for the account owner` },
      ],
    },
    LOGISTICS_INDUSTRY_PAGE.workflows.items[0],
  ],
  customScreen: {
    title: msg`Booking milestones`,
    placedOn: 'booking',
    description: msg`Shows each container's milestones from cut-off to delivery, with what is late.`,
    preview: {
      tabLabel: 'Milestones',
      title: 'Booking milestones',
      caption: 'Per container, latest first',
      columns: ['Milestone', 'Container', 'Date', 'Status'],
      rows: [
        {
          id: 'customs',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Export customs' },
            { type: 'text', value: 'TDMU 482190' },
            { type: 'text', value: 'Nov 26' },
            { type: 'select', color: 'red', value: 'On hold' },
          ],
        },
        {
          id: 'gate-in',
          cells: [
            { type: 'text', value: 'Gate in' },
            { type: 'text', value: 'TDMU 482190' },
            { type: 'text', value: 'Nov 25' },
            { type: 'select', color: 'green', value: 'Done' },
          ],
        },
        {
          id: 'cut-off',
          cells: [
            { type: 'text', value: 'Cut-off' },
            { type: 'text', value: 'TDMU 482207' },
            { type: 'text', value: 'Nov 30' },
            { type: 'select', color: 'amber', value: 'Due' },
          ],
        },
      ],
      footnote:
        'Customs is holding one container. The shipper has been emailed.',
    },
  },
  questions: [
    {
      question: msg`Do you file customs declarations?`,
      answer: msg`No. Twenty tracks each customs file and its documents. Filing stays in your customs software, linked through the API.`,
    },
  ],
};
