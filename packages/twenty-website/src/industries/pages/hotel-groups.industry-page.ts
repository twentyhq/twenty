import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { TRAVEL_HOSPITALITY_INDUSTRY_PAGE } from './travel-hospitality.industry-page';

const groupBlockRow = (
  id: string,
  name: string,
  property: string,
  roomNights: string,
  cutOff: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    property: { type: 'entity', name: property },
    roomNights: { type: 'number', value: roomNights },
    cutOff: { type: 'text', value: cutOff },
    stage: { type: 'select', ...stage },
  },
});

export const HOTEL_GROUPS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'hotel-groups',
  parentSlug: 'travel-hospitality',
  status: 'draft',
  name: msg`Hotel groups`,
  meta: {
    title: msg`Twenty for hotel groups — group and events sales`,
    description: msg`Track properties, event requests, group blocks and corporate rate agreements in an open source CRM. See an example hotel group workspace built on Twenty.`,
  },
  hero: {
    headline: msg`From RFP to signed group block, *across every property*`,
    body: msg`Event requests, group blocks, pickup and corporate rates for every hotel in the group, in one pipeline. Here is an example hotel group workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Corran Hotels',
    tableObjectId: 'groupBlock',
    viewName: 'Group blocks this quarter',
    columns: [
      { id: 'name', label: 'Group block', width: 210, isFirstColumn: true },
      { id: 'property', label: 'Property', width: 170 },
      { id: 'roomNights', label: 'Room nights', width: 120, align: 'right' },
      { id: 'cutOff', label: 'Cut-off', width: 130 },
      { id: 'stage', label: 'Stage', width: 130 },
    ],
    rows: [
      groupBlockRow(
        'dental-congress',
        'Northern dental congress',
        'Corran Harbourside',
        '420',
        'Jan 18, 2027',
        { value: 'Contracted', color: 'green' },
      ),
      groupBlockRow(
        'wedding-ashby',
        'Ashby and Kerr wedding',
        'Corran Lochside',
        '64',
        'Feb 2, 2027',
        { value: 'Contracted', color: 'green' },
      ),
      groupBlockRow(
        'sales-kickoff',
        'Ridgeback Labs sales kick-off',
        'Corran City Centre',
        '180',
        'Jan 9, 2027',
        { value: 'Tentative', color: 'amber' },
      ),
      groupBlockRow(
        'choir-tour',
        'Brightling Choir tour',
        'Corran Harbourside',
        '96',
        'Mar 1, 2027',
        { value: 'Proposal sent', color: 'blue' },
      ),
    ],
    record: {
      name: 'Northern dental congress',
      createdAt: 'Added Jul 22',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'green', value: 'Contracted' },
        },
        {
          label: 'Property',
          value: { type: 'text', value: 'Corran Harbourside' },
        },
        { label: 'Room nights', value: { type: 'text', value: '420' } },
        { label: 'Block value', value: { type: 'currency', value: '$79,800' } },
        {
          label: 'Group sales manager',
          value: { type: 'person', name: 'Callum Rennie', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`RFPs sit in a shared inbox until someone claims them.`,
      answer: msg`Each RFP becomes an event request and reaches every property with the space to host it.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We see slow pickup after the cut-off has passed.`,
      answer: msg`The pickup tracker compares rooms held with rooms picked up for each night of the block.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Corporate rates lapse before anyone renegotiates.`,
      answer: msg`A weekly workflow finds agreements ending in 60 days and opens a task with last year's room nights.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Every property can edit every rate.`,
      answer: msg`Property sales see their own rates. Only revenue management edits corporate rate agreements.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'property',
      label: msg`Properties`,
      purpose: msg`Each hotel in the group, with rooms, meeting space and its sales team.`,
      fields: [
        { label: msg`Rooms` },
        { label: msg`Meeting rooms` },
        { label: msg`City` },
        { label: msg`Director of sales`, relatesTo: 'person' },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'teal',
    },
    {
      id: 'eventRequest',
      label: msg`Event and MICE requests`,
      purpose: msg`An RFP for rooms, meeting space or both, before any property is chosen.`,
      fields: [
        { label: msg`Preferred dates` },
        { label: msg`Attendees` },
        { label: msg`Meeting space needed` },
        { label: msg`Organiser`, relatesTo: 'company' },
      ],
      previewIcon: 'briefcase',
      previewTone: 'pink',
    },
    {
      id: 'groupBlock',
      label: msg`Group blocks`,
      purpose: msg`Rooms held at one property for one group, with a cut-off and pickup.`,
      fields: [
        { label: msg`Room nights` },
        { label: msg`Cut-off date` },
        { label: msg`Pickup` },
        { label: msg`Property`, relatesTo: 'property' },
        { label: msg`Event request`, relatesTo: 'eventRequest' },
      ],
      previewIcon: 'calendarEvent',
      previewTone: 'orange',
    },
    {
      id: 'corporateRate',
      label: msg`Corporate rate agreements`,
      purpose: msg`A negotiated room rate for a company, by property and season.`,
      fields: [
        { label: msg`Rate by season` },
        { label: msg`Committed room nights` },
        { label: msg`Valid until` },
        { label: msg`Company`, relatesTo: 'company' },
        { label: msg`Property`, relatesTo: 'property' },
      ],
      previewIcon: 'coins',
      previewTone: 'amber',
    },
    {
      id: 'group',
      label: msg`Groups`,
      purpose: msg`A wedding, team or tour staying together, with a contact and a head count.`,
      fields: [
        { label: msg`Head count` },
        { label: msg`Group contact`, relatesTo: 'person' },
        { label: msg`Group blocks`, relatesTo: 'groupBlock' },
      ],
      previewIcon: 'users',
      previewTone: 'green',
    },
    {
      id: 'allotment',
      label: msg`Allotments`,
      purpose: msg`Rooms contracted to a tour operator or wholesaler at a net rate, until a release date.`,
      fields: [
        { label: msg`Net rate` },
        { label: msg`Rooms held` },
        { label: msg`Release date` },
        { label: msg`Tour operator`, relatesTo: 'company' },
        { label: msg`Property`, relatesTo: 'property' },
      ],
      previewIcon: 'key',
      previewTone: 'amber',
    },
  ],
  omittedObjectIds: ['trip', 'booking'],
  modelNotes: [
    {
      title: msg`Each hotel is a property`,
      body: msg`Rooms, meeting space and the sales team sit on the property, so RFPs reach hotels that fit.`,
    },
    {
      title: msg`A block is not a reservation`,
      body: msg`Group blocks track rooms held and picked up. Reservations stay in your property management system.`,
    },
    {
      title: msg`Rates know when they end`,
      body: msg`Corporate rates and allotments carry end and release dates that drive views and renegotiation.`,
    },
  ],
  workflows: [
    {
      title: msg`RFP received`,
      outcome: msg`Every RFP reaches the right property's sales team the hour it arrives.`,
      steps: [
        {
          kind: 'trigger',
          label: msg`An RFP form on the website is submitted`,
        },
        { kind: 'action', label: msg`Create the event request` },
        {
          kind: 'action',
          label: msg`Find properties with enough meeting space`,
        },
        {
          kind: 'agent',
          label: msg`Group proposal writer drafts a response`,
        },
        {
          kind: 'action',
          label: msg`Create a reply task for each property's sales manager`,
        },
      ],
    },
    {
      title: msg`Cut-off approaching`,
      outcome: msg`Organisers hear about slow pickup while rooms can still be released or resold.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        {
          kind: 'action',
          label: msg`Find blocks with cut-off in 21 days and pickup under 80%`,
        },
        { kind: 'action', label: msg`Email the organiser the pickup so far` },
        { kind: 'action', label: msg`Alert revenue management` },
      ],
    },
    {
      title: msg`Corporate rate expiring`,
      outcome: msg`No corporate rate lapses before its renegotiation starts.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        {
          kind: 'action',
          label: msg`Find rate agreements ending in 60 days`,
        },
        {
          kind: 'action',
          label: msg`Create a renegotiation task with last year's room nights`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Pickup tracker`,
    placedOn: 'groupBlock',
    description: msg`Compares rooms held with rooms picked up for each night of the block, ahead of the cut-off.`,
    preview: {
      tabLabel: 'Pickup',
      title: 'Pickup tracker',
      caption: 'Cut-off Jan 18, 2027',
      columns: ['Night', 'Held', 'Picked up', 'Pickup'],
      rows: [
        {
          id: 'night-1',
          cells: [
            { type: 'text', value: 'Mar 3' },
            { type: 'number', value: '120' },
            { type: 'number', value: '104' },
            { type: 'select', color: 'green', value: '87%' },
          ],
        },
        {
          id: 'night-2',
          cells: [
            { type: 'text', value: 'Mar 4' },
            { type: 'number', value: '150' },
            { type: 'number', value: '131' },
            { type: 'select', color: 'green', value: '87%' },
          ],
        },
        {
          id: 'night-3',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Mar 5' },
            { type: 'number', value: '150' },
            { type: 'number', value: '88' },
            { type: 'select', color: 'red', value: '59%' },
          ],
        },
      ],
      footnote: 'Offer Mar 5 back to revenue management before cut-off.',
    },
  },
  agents: {
    heading: msg`An agent drafts the proposal. *Sales managers send it*`,
    items: [
      {
        name: msg`Group proposal writer`,
        job: msg`Drafts an RFP response from the property's space, past blocks and the organiser's history.`,
        reads: ['eventRequest', 'property', 'groupBlock', 'company', 'note'],
        writes: ['note'],
        limit: msg`Drafts only. Cannot read corporate rate agreements.`,
      },
    ],
  },
  access: {
    heading: msg`Each property sells its rooms. *Revenue sees the rates*`,
    roles: [
      { id: 'propertySales', label: msg`Property sales` },
      { id: 'revenue', label: msg`Revenue management` },
      { id: 'director', label: msg`Group sales director` },
    ],
    rules: [
      {
        objectId: 'groupBlock',
        accessByRoleId: {
          propertySales: msg`Own property only`,
          revenue: msg`See all`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'eventRequest',
        accessByRoleId: {
          propertySales: msg`See all, edit own property`,
          revenue: msg`See all`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'corporateRate',
        accessByRoleId: {
          propertySales: msg`See own property, no edits`,
          revenue: msg`See and edit all`,
          director: msg`See all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'eventRequest' },
      { salesforceObject: 'Group Block (custom)', objectId: 'groupBlock' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API. Reservations stay in your property management system.`,
  },
  discovery: [
    {
      question: msg`How do RFPs reach you today, and who answers them?`,
      shapes: msg`Sets the RFP form and how requests route to properties.`,
    },
    {
      question: msg`Which properties sell meeting space and group rooms?`,
      shapes: msg`Decides the property fields the RFP workflow matches on.`,
    },
    {
      question: msg`What can your property management system send out?`,
      shapes: msg`Decides how pickup reaches Twenty: API, scheduled sync or CSV.`,
    },
    {
      question: msg`Who may see corporate rates and allotment net rates?`,
      shapes: msg`Sets the roles and field permissions on rates.`,
    },
    {
      question: msg`How many corporate rate agreements do you renegotiate each year?`,
      shapes: msg`Sets the lead time on the rate expiring workflow.`,
    },
  ],
  categoryQuestions: 'omit',
  questions: [
    {
      question: msg`Does this replace our property management system?`,
      answer: msg`No. Reservations stay in your property management system. Twenty holds the group sale and can sync pickup through the API.`,
    },
    {
      question: msg`Can corporate rates stay with revenue management?`,
      answer: msg`Yes. Property sales see their own property's rates, and only revenue management can edit them.`,
    },
    TRAVEL_HOSPITALITY_INDUSTRY_PAGE.questions[1],
    TRAVEL_HOSPITALITY_INDUSTRY_PAGE.questions[3],
  ],
};
