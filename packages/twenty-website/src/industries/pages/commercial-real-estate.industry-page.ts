import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { REAL_ESTATE_INDUSTRY_PAGE } from './real-estate.industry-page';

const requirementRow = (
  id: string,
  tenant: string,
  size: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
  leaseExpiry: string,
  broker: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: tenant },
    size: { type: 'text', value: size },
    stage: { type: 'select', ...stage },
    leaseExpiry: { type: 'text', value: leaseExpiry },
    broker: { type: 'person', name: broker, kind: 'person', tone: 'gray' },
  },
});

export const COMMERCIAL_REAL_ESTATE_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'commercial-real-estate',
  parentSlug: 'real-estate',
  status: 'draft',
  name: msg`Commercial real estate`,
  meta: {
    title: msg`Twenty for commercial real estate brokerage`,
    description: msg`Match tenant requirements to spaces, track lease expiries and comps in an open source CRM. See an example brokerage workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every requirement matched *to every space you know*`,
    body: msg`Tenant requirements, spaces and lease expiries, tracked years ahead. Here is an example brokerage workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Meridian Partners',
    tableObjectId: 'requirement',
    viewName: 'Open requirements',
    columns: [
      { id: 'name', label: 'Tenant', width: 190, isFirstColumn: true },
      { id: 'size', label: 'Size', width: 120 },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'leaseExpiry', label: 'Current lease ends', width: 160 },
      { id: 'broker', label: 'Tenant rep', width: 160 },
    ],
    rows: [
      requirementRow(
        'northwind',
        'Northwind Labs',
        '2,400 m²',
        { value: 'Touring', color: 'purple' },
        'Jun 2027',
        'Lena Varga',
      ),
      requirementRow(
        'cedar',
        'Cedar Health',
        '900 m²',
        { value: 'Shortlist', color: 'blue' },
        'Mar 2027',
        'Omar Haddad',
      ),
      requirementRow(
        'atlas',
        'Atlas Freight',
        '6,000 m²',
        { value: 'Heads of terms', color: 'amber' },
        'Dec 2026',
        'Lena Varga',
      ),
      requirementRow(
        'harbor',
        'Harbor Studio',
        '350 m²',
        { value: 'Signed', color: 'green' },
        'Sep 2026',
        'Jonas Weber',
      ),
    ],
    record: {
      name: 'Atlas Freight',
      createdAt: 'Added Sep 2',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Heads of terms' },
        },
        { label: 'Size', value: { type: 'text', value: '6,000 m²' } },
        {
          label: 'Current lease ends',
          value: { type: 'text', value: 'Dec 2026' },
        },
        {
          label: 'Tenant rep',
          value: { type: 'person', name: 'Lena Varga', kind: 'person' },
        },
      ],
    },
  },
  addedObjects: [
    {
      id: 'requirement',
      label: msg`Requirements`,
      purpose: msg`What a tenant needs: size, location, budget and timing.`,
      fields: [
        { label: msg`Size range` },
        { label: msg`Move-in date` },
        { label: msg`Tenant`, relatesTo: 'company' },
      ],
      previewIcon: 'targetArrow',
      previewTone: 'blue',
    },
    {
      id: 'lease',
      label: msg`Leases`,
      purpose: msg`A signed lease, with the expiry that starts the next deal.`,
      fields: [
        { label: msg`Rent per m²` },
        { label: msg`Expires on` },
        { label: msg`Property`, relatesTo: 'property' },
      ],
      previewIcon: 'fileText',
      previewTone: 'gray',
    },
  ],
  workflows: [
    {
      title: msg`Lease expiry radar`,
      outcome: msg`Every tenant hears from you 18 months before their lease ends.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        { kind: 'action', label: msg`Find leases ending within 18 months` },
        {
          kind: 'action',
          label: msg`Create a requirement and assign a broker`,
        },
      ],
    },
    {
      title: msg`New space matched`,
      outcome: msg`Brokers know who to call the day a space comes to market.`,
      steps: [
        { kind: 'trigger', label: msg`Property is marked available` },
        { kind: 'action', label: msg`Find requirements that fit its size` },
        { kind: 'agent', label: msg`Rank tenants and draft the intro` },
      ],
    },
    REAL_ESTATE_INDUSTRY_PAGE.workflows.items[1],
  ],
  customScreen: {
    title: msg`Space shortlist`,
    placedOn: 'requirement',
    description: msg`Scores available spaces against a requirement's size, area and move-in date.`,
    preview: {
      tabLabel: 'Shortlist',
      title: 'Space shortlist',
      caption: 'Scored against the requirement',
      columns: ['Space', 'Size', 'Rent per m²', 'Available'],
      rows: [
        {
          id: 'dock-7',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Dock 7, Unit B' },
            { type: 'text', value: '6,200 m²' },
            { type: 'currency', value: '$14' },
            { type: 'text', value: 'Jan 2027' },
          ],
        },
        {
          id: 'northgate',
          cells: [
            { type: 'text', value: 'Northgate Park 4' },
            { type: 'text', value: '5,400 m²' },
            { type: 'currency', value: '$12' },
            { type: 'text', value: 'Now' },
          ],
        },
        {
          id: 'riverside',
          cells: [
            { type: 'text', value: 'Riverside Hub' },
            { type: 'text', value: '7,000 m²' },
            { type: 'currency', value: '$16' },
            { type: 'text', value: 'Mar 2027' },
          ],
        },
      ],
      footnote:
        'Dock 7 is the only space that fits before the current lease ends.',
    },
  },
  questions: [
    {
      question: msg`Our deals take a year or more.`,
      answer: msg`Requirements and leases are records with dates, so long cycles show up in views and workflows, not in someone's memory.`,
    },
  ],
};
