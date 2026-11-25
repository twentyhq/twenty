import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const machineRow = (
  id: string,
  name: string,
  account: string,
  hours: string,
  warrantyEnds: { value: string; color: 'amber' | 'green' | 'red' | 'gray' },
  contract: { value: string; color: 'green' | 'blue' | 'gray' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    account: { type: 'entity', name: account },
    hours: { type: 'number', value: hours },
    warrantyEnds: { type: 'select', ...warrantyEnds },
    contract: { type: 'select', ...contract },
  },
});

export const INDUSTRIAL_EQUIPMENT_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'industrial-equipment',
  parentSlug: 'manufacturing-distribution',
  status: 'draft',
  name: msg`Industrial equipment`,
  meta: {
    title: msg`Twenty for industrial equipment makers — track every machine after the sale`,
    description: msg`Track machines, operating hours, warranties, service contracts and spare part orders in an open source CRM. See an example equipment maker's workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Know every machine you've sold *and when it needs you*`,
    body: msg`Machines, operating hours, warranties and service contracts on one record. Here is an example equipment maker's workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Varnholt Lifting',
    tableObjectId: 'asset',
    viewName: 'Machines in the field',
    columns: [
      { id: 'name', label: 'Machine', width: 210, isFirstColumn: true },
      { id: 'account', label: 'Account', width: 180 },
      { id: 'hours', label: 'Hours', width: 100, align: 'right' },
      { id: 'warrantyEnds', label: 'Warranty ends', width: 140 },
      { id: 'contract', label: 'Service contract', width: 150 },
    ],
    rows: [
      machineRow(
        'tl-61207',
        'TL-450 Telehandler · 61207',
        'Marlow Build Group',
        '1,940',
        { value: 'In 74 days', color: 'amber' },
        { value: 'Offer sent', color: 'blue' },
      ),
      machineRow(
        'cr-30418',
        'CR-80 Crawler crane · 30418',
        'Marlow Build Group',
        '4,210',
        { value: 'Ended', color: 'gray' },
        { value: 'Active', color: 'green' },
      ),
      machineRow(
        'sl-77152',
        'SL-12 Scissor lift · 77152',
        'Ashgrove Logistics',
        '860',
        { value: 'Aug 2027', color: 'green' },
        { value: 'None', color: 'gray' },
      ),
      machineRow(
        'tl-60983',
        'TL-450 Telehandler · 60983',
        'Fenwick Civil',
        '2,470',
        { value: 'In 21 days', color: 'red' },
        { value: 'None', color: 'gray' },
      ),
      machineRow(
        'sl-76604',
        'SL-12 Scissor lift · 76604',
        'Ashgrove Logistics',
        '3,105',
        { value: 'Ended', color: 'gray' },
        { value: 'Active', color: 'green' },
      ),
    ],
    record: {
      name: 'TL-450 Telehandler · 61207',
      createdAt: 'Added Mar 3',
      fields: [
        {
          label: 'Account',
          value: { type: 'text', value: 'Marlow Build Group' },
        },
        { label: 'Operating hours', value: { type: 'text', value: '1,940' } },
        {
          label: 'Warranty',
          value: { type: 'select', color: 'amber', value: 'Ends in 74 days' },
        },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Ingrid Solberg', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`We find out a warranty ended when the customer calls.`,
      answer: msg`A daily workflow flags warranties ending in 90 days and asks the owner to offer a contract.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`The telemetry knows the hours. Our CRM doesn't.`,
      answer: msg`Operating hours live on the machine, kept current by a webhook from your telemetry platform.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Nobody sees a machine's whole life in one place.`,
      answer: msg`A lifecycle tab on each machine lines up delivery, warranty, services, contracts and parts.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Dealers need the machines, not our margins.`,
      answer: msg`Dealers see machines in their territory and edit service fields. Agreement prices stay hidden.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'asset',
      label: msg`Machines`,
      purpose: msg`One machine you sold, with its serial number, hours and warranty.`,
      fields: [
        { label: msg`Serial number` },
        { label: msg`Operating hours` },
        { label: msg`Warranty ends` },
        { label: msg`Account`, relatesTo: 'company' },
        { label: msg`Dealer`, relatesTo: 'dealer' },
      ],
      previewIcon: 'tag',
      previewTone: 'orange',
    },
    {
      id: 'serviceContract',
      label: msg`Service contracts`,
      purpose: msg`Paid coverage for a machine once its warranty ends, with a term and a level.`,
      fields: [
        { label: msg`Level` },
        { label: msg`Starts on` },
        { label: msg`Ends on` },
        { label: msg`Machine`, relatesTo: 'asset' },
        { label: msg`Account`, relatesTo: 'company' },
      ],
      previewIcon: 'shieldCheck',
      previewTone: 'teal',
    },
    {
      id: 'sparePartOrder',
      label: msg`Spare part orders`,
      purpose: msg`Parts ordered for one machine, with their status and the dealer who fits them.`,
      fields: [
        { label: msg`Part numbers` },
        { label: msg`Status` },
        { label: msg`Machine`, relatesTo: 'asset' },
        { label: msg`Dealer`, relatesTo: 'dealer' },
      ],
      previewIcon: 'notes',
      previewTone: 'amber',
    },
  ],
  workflows: [
    {
      title: msg`Warranty ending`,
      outcome: msg`Every machine gets a service contract offer before its warranty runs out.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 06:00` },
        {
          kind: 'action',
          label: msg`Find machines whose warranty ends in 90 days`,
        },
        {
          kind: 'action',
          label: msg`Skip machines that already have a service contract`,
        },
        {
          kind: 'action',
          label: msg`Create a contract offer task for the account owner`,
        },
      ],
    },
    {
      title: msg`Hours threshold reached`,
      outcome: msg`Service is booked from real usage, not the calendar.`,
      steps: [
        { kind: 'trigger', label: msg`Telemetry sends hours by webhook` },
        { kind: 'action', label: msg`Update the machine's operating hours` },
        {
          kind: 'action',
          label: msg`Check whether hours passed the next service threshold`,
        },
        { kind: 'action', label: msg`Create a service visit` },
        { kind: 'action', label: msg`Email the dealer for that territory` },
      ],
    },
    {
      title: msg`Spare part order placed`,
      outcome: msg`The dealer who fits the part hears about it the moment it is ordered.`,
      steps: [
        { kind: 'trigger', label: msg`A spare part order is created` },
        { kind: 'action', label: msg`Find the dealer for the machine` },
        {
          kind: 'action',
          label: msg`Email the dealer the parts and the machine's site`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Machine lifecycle`,
    placedOn: 'asset',
    description: msg`Lines up a machine's delivery, warranty, services, parts and contract on one timeline.`,
    preview: {
      tabLabel: 'Lifecycle',
      title: 'Machine lifecycle',
      caption: 'Delivered Mar 2025',
      columns: ['Event', 'Date', 'Detail', 'Status'],
      rows: [
        {
          id: 'delivered',
          cells: [
            { type: 'text', value: 'Delivered' },
            { type: 'text', value: 'Mar 2025' },
            { type: 'text', value: 'Harbour Road site' },
            { type: 'select', color: 'gray', value: 'Done' },
          ],
        },
        {
          id: 'service-1000',
          cells: [
            { type: 'text', value: '1,000-hour service' },
            { type: 'text', value: 'Nov 2025' },
            { type: 'text', value: 'Filters, hydraulic check' },
            { type: 'select', color: 'gray', value: 'Done' },
          ],
        },
        {
          id: 'parts',
          cells: [
            { type: 'text', value: 'Spare part order' },
            { type: 'text', value: 'Sep 2026' },
            { type: 'text', value: 'Boom wear pads' },
            { type: 'select', color: 'green', value: 'Fitted' },
          ],
        },
        {
          id: 'warranty',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Warranty ends' },
            { type: 'text', value: 'Feb 2027' },
            { type: 'text', value: 'Contract offer sent' },
            { type: 'select', color: 'amber', value: 'In 74 days' },
          ],
        },
        {
          id: 'service-2000',
          cells: [
            { type: 'text', value: '2,000-hour service' },
            { type: 'text', value: 'At 2,000 h' },
            { type: 'text', value: '60 hours to go' },
            { type: 'select', color: 'blue', value: 'Upcoming' },
          ],
        },
      ],
      footnote:
        'Warranty ends in 74 days. A service contract offer is with the customer.',
    },
  },
  questions: [
    {
      question: msg`Can operating hours come from our telemetry?`,
      answer: msg`Yes, if your telemetry platform can send a webhook or call our API. There is no packaged telematics connector.`,
    },
    {
      question: msg`Can dealers place spare part orders themselves?`,
      answer: msg`Yes. With a dealer role they create orders for machines in their territory and see nothing outside it.`,
    },
  ],
  proof: { kind: 'none' },
};
