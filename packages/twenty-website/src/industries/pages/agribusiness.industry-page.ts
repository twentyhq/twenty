import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE } from './manufacturing-distribution.industry-page';

const contractRow = (
  id: string,
  name: string,
  grower: string,
  productLine: { value: string; color: 'green' | 'blue' | 'orange' },
  country: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'green' },
    grower: { type: 'entity', name: grower },
    productLine: { type: 'select', ...productLine },
    country: { type: 'text', value: country },
    status: { type: 'select', ...status },
  },
});

export const AGRIBUSINESS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'agribusiness',
  parentSlug: 'manufacturing-distribution',
  status: 'draft',
  name: msg`Agribusiness`,
  meta: {
    title: msg`Twenty for agribusiness — one CRM across growers, product lines and countries`,
    description: msg`Track growers, sites and contracts for every product line and country in an open source CRM. See an example agribusiness workspace built on Twenty.`,
  },
  hero: {
    headline: msg`One CRM across product lines *and countries*`,
    body: msg`Growers, sites and contracts for every product line, in every country you work in. Here is an example agribusiness workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Terrafirm Agro',
    tableObjectId: 'contract',
    viewName: 'Active contracts',
    columns: [
      { id: 'name', label: 'Contract', width: 180, isFirstColumn: true },
      { id: 'grower', label: 'Grower', width: 190 },
      { id: 'productLine', label: 'Product line', width: 160 },
      { id: 'country', label: 'Country', width: 120 },
      { id: 'status', label: 'Status', width: 130 },
    ],
    rows: [
      contractRow(
        'sv-2027-01',
        'SV-2027-01',
        'Serra Verde Cooperative',
        { value: 'Crop inputs', color: 'green' },
        'Brazil',
        { value: 'Signed', color: 'green' },
      ),
      contractRow(
        'sv-2027-02',
        'SV-2027-02',
        'Serra Verde Cooperative',
        { value: 'Grain offtake', color: 'blue' },
        'Brazil',
        { value: 'Delivering', color: 'blue' },
      ),
      contractRow(
        'ml-2027-04',
        'ML-2027-04',
        'Molinos del Llano',
        { value: 'Irrigation systems', color: 'orange' },
        'Colombia',
        { value: 'Negotiating', color: 'amber' },
      ),
      contractRow(
        'kp-2026-11',
        'KP-2026-11',
        'Kaveri Plains Farms',
        { value: 'Grain offtake', color: 'blue' },
        'India',
        { value: 'Delivering', color: 'blue' },
      ),
      contractRow(
        'ah-2026-07',
        'AH-2026-07',
        'Amani Highlands Growers',
        { value: 'Crop inputs', color: 'green' },
        'Kenya',
        { value: 'Closed', color: 'gray' },
      ),
    ],
    record: {
      name: 'Serra Verde Cooperative',
      createdAt: 'Added Jan 9',
      fields: [
        { label: 'Country', value: { type: 'text', value: 'Brazil' } },
        { label: 'Sites', value: { type: 'text', value: '4' } },
        {
          label: 'Size',
          value: { type: 'select', color: 'purple', value: 'Cooperative' },
        },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Lucia Ferraz', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'site',
      label: msg`Sites`,
      purpose: msg`A farm, plot or plant where a contract is delivered.`,
      fields: [
        { label: msg`Country` },
        { label: msg`Hectares` },
        { label: msg`Harvest window` },
        { label: msg`Grower`, relatesTo: 'company' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'teal',
    },
    {
      id: 'contract',
      label: msg`Contracts`,
      purpose: msg`A season or multi-year agreement with a grower, from a multinational to a smallholder.`,
      fields: [
        { label: msg`Volume` },
        { label: msg`Season` },
        { label: msg`Grower`, relatesTo: 'company' },
        { label: msg`Product line`, relatesTo: 'productLine' },
      ],
      previewIcon: 'fileText',
      previewTone: 'purple',
    },
    {
      id: 'productLine',
      label: msg`Product lines`,
      purpose: msg`One line of business, with its own stages, countries and team.`,
      fields: [
        { label: msg`Stages` },
        { label: msg`Countries` },
        { label: msg`Contracts`, relatesTo: 'contract' },
      ],
      previewIcon: 'folder',
      previewTone: 'gray',
    },
  ],
  workflows: [
    {
      title: msg`Contract signed`,
      outcome: msg`Every signed contract starts with a site and a first delivery.`,
      steps: [
        { kind: 'trigger', label: msg`Contract status is set to Signed` },
        { kind: 'action', label: msg`Create a site for the grower` },
        { kind: 'action', label: msg`Create the first delivery task` },
      ],
    },
    {
      title: msg`Season check-in`,
      outcome: msg`Field teams call every grower before harvest starts.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 07:00` },
        {
          kind: 'action',
          label: msg`Find sites with harvest in the next 30 days`,
        },
        {
          kind: 'action',
          label: msg`Create a check-in task for the site owner`,
        },
      ],
    },
    MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE.workflows.items[1],
  ],
  customScreen: {
    title: msg`Contracts by product line`,
    placedOn: 'company',
    description: msg`Groups a grower's contracts by product line, with volume and the next delivery.`,
    preview: {
      tabLabel: 'Contracts',
      title: 'Contracts by product line',
      caption: 'This season',
      columns: ['Product line', 'Contracts', 'Volume', 'Next delivery'],
      rows: [
        {
          id: 'crop-inputs',
          highlighted: true,
          cells: [
            { type: 'select', color: 'green', value: 'Crop inputs' },
            { type: 'number', value: '2' },
            { type: 'text', value: '180 t' },
            { type: 'text', value: 'Dec 3' },
          ],
        },
        {
          id: 'grain-offtake',
          cells: [
            { type: 'select', color: 'blue', value: 'Grain offtake' },
            { type: 'number', value: '1' },
            { type: 'text', value: '1,200 t' },
            { type: 'text', value: 'Mar 2027' },
          ],
        },
        {
          id: 'irrigation',
          cells: [
            { type: 'select', color: 'orange', value: 'Irrigation systems' },
            { type: 'number', value: '0' },
            { type: 'text', value: '—' },
            { type: 'text', value: 'Proposal sent' },
          ],
        },
      ],
      footnote:
        'Serra Verde buys two product lines today. Irrigation is in proposal.',
    },
  },
  questions: [
    {
      question: msg`We work with multinationals and smallholders.`,
      answer: msg`So does NetZero, across three product lines and several countries in one workspace.`,
    },
    {
      question: msg`Our needs change every season.`,
      answer: msg`NetZero's co-founder runs the CRM without a developer: “I discover a new need and in two clicks I can address it.”`,
    },
  ],
};
