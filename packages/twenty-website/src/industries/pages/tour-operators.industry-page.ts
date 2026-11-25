import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { TRAVEL_HOSPITALITY_INDUSTRY_PAGE } from './travel-hospitality.industry-page';

const departureRow = (
  id: string,
  name: string,
  departureDate: string,
  seatsSold: string,
  guide: string,
  status: { value: string; color: 'amber' | 'green' | 'red' | 'blue' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    departureDate: { type: 'text', value: departureDate },
    seatsSold: { type: 'number', value: seatsSold },
    guide: { type: 'person', name: guide, kind: 'person', tone: 'gray' },
    status: { type: 'select', ...status },
  },
});

export const TOUR_OPERATORS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'tour-operators',
  parentSlug: 'travel-hospitality',
  status: 'draft',
  name: msg`Tour operators`,
  meta: {
    title: msg`Twenty for tour operators`,
    description: msg`Track departures, passenger manifests and guides in an open source CRM. See an example tour operator workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Fill every departure, *brief every guide*`,
    body: msg`Departures, seats sold, passenger manifests and the guide who leads them, on one record. Here is an example tour operator workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Larkspur Tours',
    tableObjectId: 'departure',
    viewName: 'Spring departures',
    columns: [
      { id: 'name', label: 'Departure', width: 210, isFirstColumn: true },
      { id: 'departureDate', label: 'Departure date', width: 140 },
      { id: 'seatsSold', label: 'Seats sold', width: 110, align: 'right' },
      { id: 'guide', label: 'Guide', width: 160 },
      { id: 'status', label: 'Status', width: 130 },
    ],
    rows: [
      departureRow(
        'sicily-apr-04',
        'Sicily coast and temples',
        'Apr 4, 2027',
        '22 / 24',
        'Matteo Brancati',
        { value: 'Guaranteed', color: 'green' },
      ),
      departureRow(
        'jordan-apr-11',
        'Petra and Wadi Rum',
        'Apr 11, 2027',
        '9 / 16',
        'Leila Haddad',
        { value: 'Below minimum', color: 'red' },
      ),
      departureRow(
        'scottish-isles-may-02',
        'Scottish isles by ferry',
        'May 2, 2027',
        '14 / 18',
        'Ewan Murchie',
        { value: 'Guaranteed', color: 'green' },
      ),
      departureRow(
        'andalusia-may-16',
        'Andalusian white villages',
        'May 16, 2027',
        '11 / 20',
        'Carmen Olivares',
        { value: 'Selling', color: 'blue' },
      ),
    ],
    record: {
      name: 'Petra and Wadi Rum',
      createdAt: 'Added Aug 3',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'red', value: 'Below minimum' },
        },
        {
          label: 'Departure date',
          value: { type: 'text', value: 'Apr 11, 2027' },
        },
        { label: 'Seats sold', value: { type: 'text', value: '9 / 16' } },
        {
          label: 'Price per seat',
          value: { type: 'currency', value: '$3,290' },
        },
        {
          label: 'Guide',
          value: { type: 'person', name: 'Leila Haddad', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'departure',
      label: msg`Departures`,
      purpose: msg`One dated run of a trip, with seats to sell and a minimum to go ahead.`,
      fields: [
        { label: msg`Departure date` },
        { label: msg`Seats` },
        { label: msg`Minimum to run` },
        { label: msg`Trip`, relatesTo: 'trip' },
        { label: msg`Guide`, relatesTo: 'guide' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'orange',
    },
    {
      id: 'manifestEntry',
      label: msg`Passenger manifest`,
      purpose: msg`One passenger on one departure, with room, diet and emergency contact.`,
      fields: [
        { label: msg`Room type` },
        { label: msg`Dietary needs` },
        { label: msg`Passenger`, relatesTo: 'person' },
        { label: msg`Departure`, relatesTo: 'departure' },
        { label: msg`Booking`, relatesTo: 'booking' },
      ],
      previewIcon: 'notes',
      previewTone: 'pink',
    },
    {
      id: 'guide',
      label: msg`Guides`,
      purpose: msg`The people who lead departures, with languages, regions and availability.`,
      fields: [
        { label: msg`Languages` },
        { label: msg`Regions` },
        { label: msg`First aid valid until` },
      ],
      previewIcon: 'user',
      previewTone: 'teal',
    },
  ],
  workflows: [
    TRAVEL_HOSPITALITY_INDUSTRY_PAGE.workflows.items[0],
    {
      title: msg`Departure below minimum`,
      outcome: msg`Sales hears about a thin departure while there is still time to fill it.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        {
          kind: 'action',
          label: msg`Find departures within 60 days below their minimum`,
        },
        { kind: 'action', label: msg`Email the list to the sales team` },
        {
          kind: 'action',
          label: msg`Create a go or cancel task for the product manager`,
        },
      ],
    },
    {
      title: msg`Guide briefing`,
      outcome: msg`Every guide has the final manifest a week before departure.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find departures leaving in 7 days` },
        { kind: 'action', label: msg`Email the guide the passenger manifest` },
        { kind: 'action', label: msg`Set the departure to Briefed` },
      ],
    },
  ],
  customScreen: {
    title: msg`Manifest overview`,
    placedOn: 'departure',
    description: msg`Shows who is travelling on the departure, with rooms, diets and missing details, ready for the guide.`,
    preview: {
      tabLabel: 'Manifest',
      title: 'Manifest overview',
      caption: '9 of 16 seats sold',
      columns: ['Passenger', 'Room', 'Dietary needs', 'Passport'],
      rows: [
        {
          id: 'ana',
          cells: [
            { type: 'person', name: 'Ana Sörensen', kind: 'person' },
            { type: 'text', value: 'Twin' },
            { type: 'text', value: 'Vegetarian' },
            { type: 'select', color: 'green', value: 'Received' },
          ],
        },
        {
          id: 'george',
          highlighted: true,
          cells: [
            { type: 'person', name: 'George Ashdown', kind: 'person' },
            { type: 'text', value: 'Single' },
            { type: 'text', value: 'None' },
            { type: 'select', color: 'red', value: 'Missing' },
          ],
        },
        {
          id: 'priya',
          cells: [
            { type: 'person', name: 'Priya Venkat', kind: 'person' },
            { type: 'text', value: 'Twin' },
            { type: 'text', value: 'Gluten free' },
            { type: 'select', color: 'green', value: 'Received' },
          ],
        },
      ],
      footnote: 'Chase George for his passport before the guide briefing.',
    },
  },
  questions: [
    {
      question: msg`Can guides see their manifests without seeing our margins?`,
      answer: msg`Yes. A guide role can see the departures they lead and their manifests, with prices and net rates hidden.`,
    },
  ],
};
