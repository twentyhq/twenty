import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { PUBLIC_SECTOR_DEFENSE_INDUSTRY_PAGE } from './public-sector-defense.industry-page';

const tenderRow = (
  id: string,
  name: string,
  buyer: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  exportLicence: { value: string; color: 'amber' | 'green' | 'gray' },
  deadline: string,
  owner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    buyer: { type: 'entity', name: buyer },
    stage: { type: 'select', ...stage },
    exportLicence: { type: 'select', ...exportLicence },
    deadline: { type: 'text', value: deadline },
    owner: { type: 'person', name: owner, kind: 'person', tone: 'gray' },
  },
});

export const DEFENSE_SUPPLIERS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'defense-suppliers',
  parentSlug: 'public-sector-defense',
  status: 'draft',
  name: msg`Defense suppliers`,
  meta: {
    title: msg`Twenty for defense suppliers — a CRM you host yourself`,
    description: msg`Track tenders, export licences, staff clearances and offset obligations in an open source CRM on your own servers. See an example supplier workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Bid, comply and deliver from a CRM *you host yourself*`,
    body: msg`Tenders, export licences, clearances and offset obligations on servers you run. Here is an example supplier workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Varnholt Systems',
    tableObjectId: 'tender',
    viewName: 'Open tenders',
    columns: [
      { id: 'name', label: 'Tender', width: 200, isFirstColumn: true },
      { id: 'buyer', label: 'Buyer', width: 190 },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'exportLicence', label: 'Export licence', width: 140 },
      { id: 'deadline', label: 'Deadline', width: 130 },
      { id: 'owner', label: 'Bid owner', width: 160 },
    ],
    rows: [
      tenderRow(
        'radio',
        'Secure radio refit',
        'Ostland Procurement Agency',
        { value: 'Go/no-go', color: 'amber' },
        { value: 'Pending', color: 'amber' },
        'Jan 22, 2027',
        'Mattias Holm',
      ),
      tenderRow(
        'telemetry',
        'Vehicle telemetry upgrade',
        'Brenmark Defence Logistics',
        { value: 'Drafting', color: 'blue' },
        { value: 'Granted', color: 'green' },
        'Feb 10, 2027',
        'Clara Vos',
      ),
      tenderRow(
        'simulator',
        'Training simulator support',
        'Ostland Procurement Agency',
        { value: 'Drafting', color: 'blue' },
        { value: 'Not needed', color: 'gray' },
        'Mar 4, 2027',
        'Mattias Holm',
      ),
      tenderRow(
        'shelters',
        'Field shelter supply',
        'Kessel Joint Support Office',
        { value: 'Submitted', color: 'green' },
        { value: 'Granted', color: 'green' },
        'Dec 15, 2026',
        'Anouk Peeters',
      ),
    ],
    record: {
      name: 'Secure radio refit',
      createdAt: 'Added Nov 18',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Go/no-go' },
        },
        {
          label: 'Buyer',
          value: { type: 'text', value: 'Ostland Procurement Agency' },
        },
        { label: 'Deadline', value: { type: 'text', value: 'Jan 22, 2027' } },
        {
          label: 'Bid owner',
          value: { type: 'person', name: 'Mattias Holm', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'tender',
      label: msg`Tenders`,
      purpose: msg`One procurement, with the licences and clearances it depends on.`,
      fields: [
        { label: msg`Deadline` },
        { label: msg`Decision` },
        { label: msg`Buyer`, relatesTo: 'company' },
        { label: msg`Programme`, relatesTo: 'programme' },
      ],
      previewIcon: 'fileText',
      previewTone: 'blue',
    },
    {
      id: 'exportLicence',
      label: msg`Export licences`,
      purpose: msg`Permission to ship to one destination, with an end user and an expiry.`,
      fields: [
        { label: msg`Destination` },
        { label: msg`Expires on` },
        { label: msg`Tender`, relatesTo: 'tender' },
      ],
      previewIcon: 'planet',
      previewTone: 'amber',
    },
    {
      id: 'clearance',
      label: msg`Clearances`,
      purpose: msg`A person's clearance, with its level and the date it lapses.`,
      fields: [
        { label: msg`Level` },
        { label: msg`Expires on` },
        { label: msg`Holder`, relatesTo: 'person' },
      ],
      previewIcon: 'key',
      previewTone: 'red',
    },
    {
      id: 'offsetObligation',
      label: msg`Offset obligations`,
      purpose: msg`Work a contract commits you to place locally, tracked against its target.`,
      fields: [
        { label: msg`Target value` },
        { label: msg`Delivered so far` },
        { label: msg`Programme`, relatesTo: 'programme' },
      ],
      previewIcon: 'coins',
      previewTone: 'orange',
    },
  ],
  workflows: [
    {
      title: msg`Export licence watch`,
      outcome: msg`No shipment waits on a licence that expired.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        {
          kind: 'action',
          label: msg`Find export licences expiring within 90 days`,
        },
        { kind: 'agent', label: msg`Prepare the renewal file` },
        {
          kind: 'action',
          label: msg`Create a task for the trade compliance lead`,
        },
      ],
    },
    {
      title: msg`Clearance expiring`,
      outcome: msg`Security hears about a lapsing clearance before access does.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find clearances expiring within 45 days` },
        { kind: 'action', label: msg`Email the security officer` },
        { kind: 'action', label: msg`Create a renewal task for the holder` },
      ],
    },
    PUBLIC_SECTOR_DEFENSE_INDUSTRY_PAGE.workflows.items[1],
  ],
  customScreen: {
    title: msg`Bid readiness`,
    placedOn: 'tender',
    description: msg`Checks export licences, team clearances, offset plans and local content before submission.`,
    preview: {
      tabLabel: 'Readiness',
      title: 'Bid readiness',
      caption: 'Checked before submission',
      columns: ['Check', 'Status', 'Owner', 'Due'],
      rows: [
        {
          id: 'export-licence',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Export licence' },
            { type: 'select', color: 'amber', value: 'Pending' },
            { type: 'person', name: 'Clara Vos', kind: 'person' },
            { type: 'text', value: 'Jan 8' },
          ],
        },
        {
          id: 'clearances',
          cells: [
            { type: 'text', value: 'Team clearances' },
            { type: 'select', color: 'green', value: '6 of 6 valid' },
            { type: 'person', name: 'Anouk Peeters', kind: 'person' },
            { type: 'text', value: 'Done' },
          ],
        },
        {
          id: 'offset',
          cells: [
            { type: 'text', value: 'Offset plan' },
            { type: 'select', color: 'blue', value: 'Drafted' },
            { type: 'person', name: 'Mattias Holm', kind: 'person' },
            { type: 'text', value: 'Jan 15' },
          ],
        },
        {
          id: 'local-content',
          cells: [
            { type: 'text', value: 'Local content declaration' },
            { type: 'select', color: 'gray', value: 'Not started' },
            { type: 'person', name: 'Mattias Holm', kind: 'person' },
            { type: 'text', value: 'Jan 18' },
          ],
        },
      ],
      footnote:
        'The export licence is the only open blocker before the deadline.',
    },
  },
  questions: [
    {
      question: msg`We hold export licences for several countries.`,
      answer: msg`Each licence is a record with a destination and an expiry, linked to the tenders that need it.`,
    },
  ],
};
