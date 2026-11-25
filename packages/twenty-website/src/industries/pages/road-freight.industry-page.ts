import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { LOGISTICS_INDUSTRY_PAGE } from './logistics.industry-page';

const loadRow = (
  id: string,
  name: string,
  shipper: string,
  lane: string,
  pickup: string,
  status: { value: string; color: 'red' | 'amber' | 'green' | 'blue' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: 'L', tone: 'orange' },
    shipper: { type: 'entity', name: shipper },
    lane: { type: 'text', value: lane },
    pickup: { type: 'text', value: pickup },
    status: { type: 'select', ...status },
  },
});

export const ROAD_FREIGHT_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'road-freight',
  parentSlug: 'logistics',
  status: 'draft',
  name: msg`Road freight`,
  meta: {
    title: msg`Twenty for trucking carriers and brokers — loads, capacity and shipper contracts`,
    description: msg`Match loads to truck capacity and track shipper contracts in an open source CRM. See an example road freight workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Match loads and lanes *before the truck runs empty*`,
    body: msg`Loads, truck capacity and shipper contracts on the lanes you run. Here is an example road freight workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Redfern Haulage',
    tableObjectId: 'load',
    viewName: 'Uncovered loads',
    columns: [
      { id: 'name', label: 'Load', width: 130, isFirstColumn: true },
      { id: 'shipper', label: 'Shipper', width: 180 },
      { id: 'lane', label: 'Lane', width: 190 },
      { id: 'pickup', label: 'Pickup', width: 130 },
      { id: 'status', label: 'Status', width: 140 },
    ],
    rows: [
      loadRow(
        'ld-90412',
        'LD-90412',
        'Ashcombe Dairy',
        'Leeds → Bristol',
        'Today 16:00',
        { value: 'Uncovered', color: 'red' },
      ),
      loadRow(
        'ld-90408',
        'LD-90408',
        'Fennick Paper',
        'Glasgow → Manchester',
        'Tomorrow 06:00',
        { value: 'Offered', color: 'amber' },
      ),
      loadRow(
        'ld-90399',
        'LD-90399',
        'Ashcombe Dairy',
        'Leeds → Southampton',
        'Tomorrow 09:00',
        { value: 'Covered', color: 'green' },
      ),
      loadRow(
        'ld-90391',
        'LD-90391',
        'Thornbury Build',
        'Birmingham → Leeds',
        'Nov 27',
        { value: 'Quoted', color: 'blue' },
      ),
    ],
    record: {
      name: 'LD-90412',
      createdAt: 'Added today',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'red', value: 'Uncovered' },
        },
        {
          label: 'Equipment',
          value: { type: 'text', value: 'Reefer, 26 pallets' },
        },
        { label: 'Rate', value: { type: 'currency', value: '£780' } },
        {
          label: 'Planner',
          value: { type: 'person', name: 'Gareth Lowe', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'load',
      label: msg`Loads`,
      purpose: msg`One pickup and delivery for a shipper, with equipment, weight and rate.`,
      fields: [
        { label: msg`Pickup at` },
        { label: msg`Equipment` },
        { label: msg`Lane`, relatesTo: 'lane' },
        { label: msg`Shipper`, relatesTo: 'company' },
        { label: msg`Truck`, relatesTo: 'fleetCapacity' },
      ],
      previewIcon: 'tag',
      previewTone: 'orange',
    },
    {
      id: 'fleetCapacity',
      label: msg`Truck capacity`,
      purpose: msg`A truck, own or subcontracted, with where and when it is next empty.`,
      fields: [
        { label: msg`Equipment` },
        { label: msg`Empty at` },
        { label: msg`Empty from` },
        { label: msg`Carrier`, relatesTo: 'carrier' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'teal',
    },
    {
      id: 'shipperContract',
      label: msg`Shipper contracts`,
      purpose: msg`Committed loads per week on set lanes, at agreed rates and fuel terms.`,
      fields: [
        { label: msg`Loads per week` },
        { label: msg`Fuel surcharge terms` },
        { label: msg`Shipper`, relatesTo: 'company' },
        { label: msg`Lanes`, relatesTo: 'lane' },
      ],
      previewIcon: 'fileText',
      previewTone: 'purple',
    },
  ],
  workflows: [
    {
      title: msg`New load matched`,
      outcome: msg`Planners see which trucks fit a load the minute it is booked.`,
      steps: [
        { kind: 'trigger', label: msg`Load is created` },
        { kind: 'action', label: msg`Find trucks empty near the pickup` },
        { kind: 'agent', label: msg`Rank trucks by empty miles and rate` },
        { kind: 'action', label: msg`Assign the best match to the planner` },
      ],
    },
    {
      title: msg`Load still uncovered`,
      outcome: msg`No load reaches its pickup day without a truck.`,
      steps: [
        { kind: 'trigger', label: msg`Every hour` },
        {
          kind: 'action',
          label: msg`Find loads uncovered within 24 hours of pickup`,
        },
        { kind: 'action', label: msg`Email the planner and the shipper's rep` },
      ],
    },
    LOGISTICS_INDUSTRY_PAGE.workflows.items[1],
  ],
  customScreen: {
    title: msg`Capacity match`,
    placedOn: 'load',
    description: msg`Lists trucks that are empty near the pickup, with distance and the time they free up.`,
    preview: {
      tabLabel: 'Capacity match',
      title: 'Capacity match',
      caption: 'Empty near the pickup, closest first',
      columns: ['Truck', 'Carrier', 'Empty at', 'Free from'],
      rows: [
        {
          id: 'rf-214',
          highlighted: true,
          cells: [
            { type: 'text', value: 'RF-214 · Reefer' },
            { type: 'text', value: 'Redfern fleet' },
            { type: 'text', value: 'Wakefield, 9 mi' },
            { type: 'select', color: 'green', value: '14:30' },
          ],
        },
        {
          id: 'hk-77',
          cells: [
            { type: 'text', value: 'HK-77 · Reefer' },
            { type: 'text', value: 'Hollins Transport' },
            { type: 'text', value: 'York, 26 mi' },
            { type: 'select', color: 'amber', value: '15:45' },
          ],
        },
        {
          id: 'rf-198',
          cells: [
            { type: 'text', value: 'RF-198 · Reefer' },
            { type: 'text', value: 'Redfern fleet' },
            { type: 'text', value: 'Sheffield, 34 mi' },
            { type: 'select', color: 'red', value: '17:10' },
          ],
        },
      ],
      footnote: 'RF-214 empties 9 miles away and makes the 16:00 pickup.',
    },
  },
  questions: [
    {
      question: msg`We broker loads as well as run trucks.`,
      answer: msg`Own and subcontracted trucks are both capacity records, with the carrier as a company. One workspace covers both.`,
    },
  ],
};
