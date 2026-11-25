import { msg } from '@lingui/core/macro';
import { IconPlane } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const tripRow = (
  id: string,
  name: string,
  account: string,
  travellers: string,
  departs: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    account: { type: 'entity', name: account },
    travellers: { type: 'number', value: travellers },
    departs: { type: 'text', value: departs },
    stage: { type: 'select', ...stage },
  },
});

export const TRAVEL_HOSPITALITY_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'travel-hospitality',
  status: 'draft',
  name: msg`Travel and hospitality`,
  menu: { description: msg`Trips, groups and suppliers`, icon: IconPlane },
  meta: {
    title: msg`Twenty for travel and hospitality — trips, groups and suppliers in one CRM`,
    description: msg`Model trips, bookings, groups, suppliers and contracted rates in an open source CRM. See an example travel workspace built on Twenty.`,
  },
  hero: {
    headline: msg`A CRM that knows the trip, *not just the opportunity*`,
    body: msg`Trips, groups, suppliers and allotments on one record, with bookings synced from your booking engine. Here is an example travel workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Saltmarsh Journeys',
    tableObjectId: 'trip',
    viewName: 'Upcoming trips',
    columns: [
      { id: 'name', label: 'Trip', width: 200, isFirstColumn: true },
      { id: 'account', label: 'Account', width: 170 },
      { id: 'travellers', label: 'Travellers', width: 110, align: 'right' },
      { id: 'departs', label: 'Departs', width: 130 },
      { id: 'stage', label: 'Stage', width: 130 },
    ],
    rows: [
      tripRow(
        'douro-cycling',
        'Douro valley cycling',
        'Pembury Rotary Club',
        '18',
        'May 6, 2027',
        { value: 'Deposit paid', color: 'green' },
      ),
      tripRow(
        'iceland-incentive',
        'Iceland incentive',
        'Calloway Instruments',
        '42',
        'Mar 14, 2027',
        { value: 'Proposal sent', color: 'amber' },
      ),
      tripRow(
        'kyoto-autumn',
        'Kyoto in autumn',
        'Whitlow Alumni Society',
        '24',
        'Oct 19, 2027',
        { value: 'Itinerary draft', color: 'blue' },
      ),
      tripRow(
        'atlas-trek',
        'Atlas mountains trek',
        'Northgate Walking Group',
        '12',
        'Apr 2, 2027',
        { value: 'Final payment', color: 'amber' },
      ),
      tripRow(
        'lisbon-offsite',
        'Lisbon leadership offsite',
        'Brennock Software',
        '30',
        'Returned',
        { value: 'Returned', color: 'gray' },
      ),
    ],
    record: {
      name: 'Iceland incentive',
      createdAt: 'Added Oct 28',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Proposal sent' },
        },
        {
          label: 'Account',
          value: { type: 'text', value: 'Calloway Instruments' },
        },
        { label: 'Trip value', value: { type: 'currency', value: '$136,500' } },
        { label: 'Departs', value: { type: 'text', value: 'Mar 14, 2027' } },
        {
          label: 'Trip owner',
          value: { type: 'person', name: 'Freya Lindgren', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our itineraries live in Word and email.`,
      answer: msg`An itinerary summary on each trip lists days, suppliers and confirmations from the records themselves.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Group deposits get chased by hand.`,
      answer: msg`A daily workflow finds deposits and final payments coming due and reminds the group contact.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Supplier rates expire and nobody notices.`,
      answer: msg`Contracted rates carry release and expiry dates, so a view lists every rate ending soon.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Our booking engine and CRM never agree.`,
      answer: msg`Bookings stay in the booking engine. A webhook keeps the booking record in Twenty in step.`,
      answeredBy: 'switching',
    },
  ],
  dataModel: {
    heading: msg`Model trips *the way your sales team sells them*`,
    objects: [
      {
        id: 'trip',
        label: msg`Trips`,
        purpose: msg`One itinerary for one account, from first proposal to the return home.`,
        fields: [
          { label: msg`Departs on` },
          { label: msg`Returns on` },
          { label: msg`Trip value` },
          { label: msg`Account`, relatesTo: 'company' },
        ],
        previewIcon: 'planet',
        previewTone: 'blue',
      },
      {
        id: 'booking',
        label: msg`Bookings`,
        purpose: msg`The booking engine's reference, with its status and payment due dates.`,
        fields: [
          { label: msg`Booking reference` },
          { label: msg`Deposit due on` },
          { label: msg`Final payment due on` },
          { label: msg`Trip`, relatesTo: 'trip' },
          { label: msg`Lead traveller`, relatesTo: 'person' },
        ],
        previewIcon: 'fileText',
        previewTone: 'purple',
      },
      {
        id: 'group',
        label: msg`Groups`,
        purpose: msg`The people travelling together, with a group contact and a head count.`,
        fields: [
          { label: msg`Head count` },
          { label: msg`Group contact`, relatesTo: 'person' },
          { label: msg`Trip`, relatesTo: 'trip' },
        ],
        previewIcon: 'users',
        previewTone: 'green',
      },
      {
        id: 'allotment',
        label: msg`Contracted rates`,
        purpose: msg`An allotment or net rate agreed with a supplier, valid between two dates.`,
        fields: [
          { label: msg`Net rate` },
          { label: msg`Units held` },
          { label: msg`Release date` },
          { label: msg`Expires on` },
          { label: msg`Supplier`, relatesTo: 'company' },
        ],
        previewIcon: 'key',
        previewTone: 'amber',
      },
    ],
    notes: [
      {
        title: msg`Suppliers are companies`,
        body: msg`Hotels, coach firms and guides sit beside client accounts, told apart by a type field.`,
      },
      {
        title: msg`Bookings point back to the engine`,
        body: msg`Each booking keeps the engine's reference, so nothing is booked twice and nothing is re-keyed.`,
      },
      {
        title: msg`Rates know when they end`,
        body: msg`Release and expiry dates on each contracted rate drive views, reminders and renewals.`,
      },
    ],
  },
  workflows: {
    heading: msg`The admin runs itself. *Your team sells the trip*`,
    items: [
      {
        title: msg`Booking received`,
        outcome: msg`Every new booking is in the CRM with its traveller tasks within a minute.`,
        steps: [
          {
            kind: 'trigger',
            label: msg`The booking engine posts a new booking to a webhook`,
          },
          { kind: 'action', label: msg`Create or update the booking record` },
          { kind: 'action', label: msg`Link it to the trip and the account` },
          {
            kind: 'action',
            label: msg`Create tasks for passport details and the rooming list`,
          },
        ],
      },
      {
        title: msg`Payment due`,
        outcome: msg`No deposit or final payment slips past its date unnoticed.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          {
            kind: 'action',
            label: msg`Find bookings with a payment due in 7 days`,
          },
          { kind: 'action', label: msg`Email the group contact a reminder` },
          { kind: 'action', label: msg`Create a follow-up task for the agent` },
        ],
      },
      {
        title: msg`Trip returned`,
        outcome: msg`Every returning group gets a feedback form and a next trip to consider.`,
        steps: [
          { kind: 'trigger', label: msg`Trip stage is set to Returned` },
          { kind: 'action', label: msg`Email the travellers a feedback form` },
          {
            kind: 'agent',
            label: msg`Trip planner drafts a rebooking suggestion`,
          },
        ],
      },
    ],
  },
  agents: {
    heading: msg`An agent drafts the proposal. *Your team sends it*`,
    items: [
      {
        name: msg`Trip planner`,
        job: msg`Drafts a trip proposal from the account's past trips and current supplier rates.`,
        reads: ['company', 'trip', 'booking', 'allotment', 'note'],
        writes: ['note'],
        limit: msg`Drafts only. A salesperson reviews the proposal and sends it.`,
      },
    ],
  },
  customScreen: {
    title: msg`Itinerary summary`,
    placedOn: 'trip',
    description: msg`Lists each day of the trip with its supplier and confirmation status, built from the linked records.`,
    preview: {
      tabLabel: 'Itinerary',
      title: 'Itinerary summary',
      caption: '5 days, 42 travellers',
      columns: ['Day', 'Supplier', 'Service', 'Status'],
      rows: [
        {
          id: 'day-1',
          cells: [
            { type: 'text', value: 'Day 1' },
            { type: 'entity', name: 'Hotel Fjallsbrun' },
            { type: 'text', value: '21 rooms, 4 nights' },
            { type: 'select', color: 'green', value: 'Confirmed' },
          ],
        },
        {
          id: 'day-2',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Day 2' },
            { type: 'entity', name: 'Grjót Coaches' },
            { type: 'text', value: 'Golden circle coach' },
            { type: 'select', color: 'amber', value: 'On request' },
          ],
        },
        {
          id: 'day-3',
          cells: [
            { type: 'text', value: 'Day 3' },
            { type: 'entity', name: 'Vatnaskil Glacier Tours' },
            { type: 'text', value: 'Glacier walk' },
            { type: 'select', color: 'green', value: 'Confirmed' },
          ],
        },
        {
          id: 'day-4',
          cells: [
            { type: 'text', value: 'Day 4' },
            { type: 'entity', name: 'Hotel Fjallsbrun' },
            { type: 'text', value: 'Gala dinner, 42 covers' },
            { type: 'select', color: 'gray', value: 'Not requested' },
          ],
        },
      ],
      footnote: 'Confirm the day 2 coach before the proposal is signed.',
    },
  },
  access: {
    heading: msg`Sales see their accounts. *Contracting sees the net rates*`,
    roles: [
      { id: 'sales', label: msg`Sales` },
      { id: 'contracting', label: msg`Product and contracting` },
      { id: 'manager', label: msg`Sales manager` },
    ],
    rules: [
      {
        objectId: 'trip',
        accessByRoleId: {
          sales: msg`Own accounts only`,
          contracting: msg`See all`,
          manager: msg`See and edit all`,
        },
      },
      {
        objectId: 'booking',
        accessByRoleId: {
          sales: msg`Own accounts only`,
          contracting: msg`See all`,
          manager: msg`See all`,
        },
      },
      {
        objectId: 'allotment',
        accessByRoleId: {
          sales: msg`Availability only, no net rates`,
          contracting: msg`See and edit all`,
          manager: msg`Availability only, no net rates`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Opportunity', objectId: 'trip' },
      { salesforceObject: 'Booking (custom)', objectId: 'booking' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API. The booking engine connects by webhook and API.`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Do we have to replace our booking engine?`,
      answer: msg`No. Bookings stay in your booking engine. Twenty receives them by webhook and writes back through its own API.`,
    },
    {
      question: msg`Does Twenty take card payments?`,
      answer: msg`No. Payments stay in your payment system. Twenty records due dates and status so reminders go out on time.`,
    },
    {
      question: msg`Can net rates stay with the contracting team?`,
      answer: msg`Yes. Field permissions hide net rates from sales, who still see availability on each contracted rate.`,
    },
    {
      question: msg`Who owns our client data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`Which booking engine do you use, and what can it send out?`,
      shapes: msg`Decides between a webhook, a scheduled API sync or a CSV import.`,
    },
    {
      question: msg`How does a trip go from enquiry to departure today?`,
      shapes: msg`Each stage becomes a trip stage and each handover a workflow step.`,
    },
    {
      question: msg`How do you contract with suppliers?`,
      shapes: msg`Allotments, net rates or free sale shape the contracted rate fields.`,
    },
    {
      question: msg`Who may see net rates and margins?`,
      shapes: msg`Sets the roles and field permissions on contracted rates.`,
    },
    {
      question: msg`What happens after a group comes home?`,
      shapes: msg`Shapes the feedback form and the rebooking step in the trip returned workflow.`,
    },
  ],
};
