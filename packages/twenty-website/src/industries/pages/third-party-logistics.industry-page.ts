import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { LOGISTICS_INDUSTRY_PAGE } from './logistics.industry-page';

const onboardingRow = (
  id: string,
  customer: string,
  warehouse: string,
  goLive: string,
  stage: { value: string; color: 'purple' | 'amber' | 'blue' | 'green' },
  owner: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: customer },
    warehouse: { type: 'text', value: warehouse },
    goLive: { type: 'text', value: goLive },
    stage: { type: 'select', ...stage },
    owner: { type: 'person', name: owner, kind: 'person', tone: 'gray' },
  },
});

export const THIRD_PARTY_LOGISTICS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'third-party-logistics',
  parentSlug: 'logistics',
  status: 'draft',
  name: msg`Third-party logistics`,
  meta: {
    title: msg`Twenty for 3PL warehousing — storage contracts and onboarding in one CRM`,
    description: msg`Track warehouses, storage contracts and customer onboarding projects in an open source CRM. See an example 3PL workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Win the warehouse deal, *onboard without the scramble*`,
    body: msg`Warehouse space, storage contracts and go-live projects, handed from sales to operations on one record. Here is an example 3PL workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Brookline Fulfilment',
    tableObjectId: 'onboardingProject',
    viewName: 'Onboarding',
    columns: [
      { id: 'name', label: 'Customer', width: 180, isFirstColumn: true },
      { id: 'warehouse', label: 'Warehouse', width: 160 },
      { id: 'goLive', label: 'Go-live', width: 110 },
      { id: 'stage', label: 'Stage', width: 150 },
      { id: 'owner', label: 'Onboarding lead', width: 160 },
    ],
    rows: [
      onboardingRow(
        'velora',
        'Velora Skincare',
        'Tilbury DC',
        'Jan 12',
        { value: 'Integration test', color: 'amber' },
        'Priya Sandhu',
      ),
      onboardingRow(
        'quill',
        'Quill & Hart',
        'Daventry 2',
        'Feb 3',
        { value: 'Racking setup', color: 'purple' },
        'Tom Okafor',
      ),
      onboardingRow(
        'nordpeak',
        'Nordpeak Outdoor',
        'Tilbury DC',
        'Mar 1',
        { value: 'Kick-off', color: 'blue' },
        'Priya Sandhu',
      ),
      onboardingRow(
        'marlow',
        'Marlow Pet Supply',
        'Daventry 2',
        'Nov 4',
        { value: 'Live', color: 'green' },
        'Tom Okafor',
      ),
    ],
    record: {
      name: 'Velora Skincare onboarding',
      createdAt: 'Added Oct 20',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Integration test' },
        },
        { label: 'Warehouse', value: { type: 'text', value: 'Tilbury DC' } },
        { label: 'Pallet positions', value: { type: 'text', value: '1,800' } },
        {
          label: 'Onboarding lead',
          value: { type: 'person', name: 'Priya Sandhu', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'warehouse',
      label: msg`Warehouses`,
      purpose: msg`A site with its pallet positions, current occupancy and services offered.`,
      fields: [
        { label: msg`Pallet positions` },
        { label: msg`Occupancy` },
        { label: msg`Services` },
      ],
      previewIcon: 'home',
      previewTone: 'gray',
    },
    {
      id: 'storageContract',
      label: msg`Storage contracts`,
      purpose: msg`Space, handling rates and a term agreed with one customer in one warehouse.`,
      fields: [
        { label: msg`Pallet positions` },
        { label: msg`Term ends` },
        { label: msg`Customer`, relatesTo: 'company' },
        { label: msg`Warehouse`, relatesTo: 'warehouse' },
      ],
      previewIcon: 'fileText',
      previewTone: 'purple',
    },
    {
      id: 'onboardingProject',
      label: msg`Onboarding projects`,
      purpose: msg`The steps from signature to the first order shipped, with owners and dates.`,
      fields: [
        { label: msg`Stage` },
        { label: msg`Go-live date` },
        { label: msg`Contract`, relatesTo: 'storageContract' },
        { label: msg`Warehouse`, relatesTo: 'warehouse' },
      ],
      previewIcon: 'checkbox',
      previewTone: 'amber',
    },
  ],
  workflows: [
    {
      title: msg`Contract signed`,
      outcome: msg`Operations gets the project the hour sales closes the deal.`,
      steps: [
        { kind: 'trigger', label: msg`Storage contract is marked signed` },
        { kind: 'action', label: msg`Create the onboarding project` },
        {
          kind: 'action',
          label: msg`Create tasks for racking, WMS setup and testing`,
        },
        { kind: 'action', label: msg`Email the warehouse manager` },
      ],
    },
    {
      title: msg`Space running out`,
      outcome: msg`Sales stops promising space a warehouse no longer has.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 07:00` },
        { kind: 'action', label: msg`Fetch occupancy from the WMS` },
        { kind: 'action', label: msg`Update each warehouse` },
        { kind: 'action', label: msg`Email sales when a site passes 90%` },
      ],
    },
    LOGISTICS_INDUSTRY_PAGE.workflows.items[2],
  ],
  customScreen: {
    title: msg`Go-live checklist`,
    placedOn: 'onboardingProject',
    description: msg`Lists every onboarding step with its owner and due date, late steps first.`,
    preview: {
      tabLabel: 'Go-live',
      title: 'Go-live checklist',
      caption: 'Late steps first',
      columns: ['Step', 'Owner', 'Due', 'Status'],
      rows: [
        {
          id: 'edi-test',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Order feed test' },
            { type: 'text', value: 'Customer IT' },
            { type: 'text', value: 'Nov 28' },
            { type: 'select', color: 'red', value: 'Late' },
          ],
        },
        {
          id: 'racking',
          cells: [
            { type: 'text', value: 'Racking in zone C' },
            { type: 'text', value: 'Site team' },
            { type: 'text', value: 'Dec 6' },
            { type: 'select', color: 'amber', value: 'In progress' },
          ],
        },
        {
          id: 'sku-load',
          cells: [
            { type: 'text', value: 'SKU master loaded' },
            { type: 'text', value: 'Priya Sandhu' },
            { type: 'text', value: 'Nov 18' },
            { type: 'select', color: 'green', value: 'Done' },
          ],
        },
      ],
      footnote: 'The order feed test is late. Go-live is at risk.',
    },
  },
  agents: {
    heading: msg`Agents that price the space. *People sign the deal*`,
    items: [
      {
        name: msg`Rate card drafter`,
        job: msg`Drafts storage and handling rates for a prospect from similar contracts and the site's occupancy.`,
        reads: ['storageContract', 'warehouse', 'company'],
        writes: ['note'],
        limit: msg`Writes notes only. Sales sets the final rates.`,
      },
      {
        name: msg`Onboarding reporter`,
        job: msg`Summarizes open onboarding steps each week and flags the ones that put go-live at risk.`,
        reads: ['onboardingProject', 'task'],
        writes: ['note', 'task'],
        limit: msg`Writes notes and tasks only and cannot move a go-live date.`,
      },
    ],
  },
  questions: [
    {
      question: msg`Can it connect to our WMS?`,
      answer: msg`There is no packaged WMS connector. Use the API, webhooks or a scheduled workflow that calls your WMS over HTTP.`,
    },
  ],
};
