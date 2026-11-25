import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE } from './manufacturing-distribution.industry-page';

const accountRow = (
  id: string,
  account: string,
  territory: string,
  usualCycle: string,
  lastOrder: string,
  rhythm: { value: string; color: 'amber' | 'green' | 'red' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: account },
    territory: { type: 'text', value: territory },
    usualCycle: { type: 'text', value: usualCycle },
    lastOrder: { type: 'text', value: lastOrder },
    rhythm: { type: 'select', ...rhythm },
  },
});

export const WHOLESALE_DISTRIBUTION_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'wholesale-distribution',
  parentSlug: 'manufacturing-distribution',
  status: 'draft',
  name: msg`Wholesale distribution`,
  meta: {
    title: msg`Twenty for wholesale distributors — catch accounts that stop reordering`,
    description: msg`Track customer accounts, reorders, price lists and territories in an open source CRM. See an example wholesale distributor's workspace built on Twenty.`,
  },
  hero: {
    headline: msg`See who stopped reordering *before they leave*`,
    body: msg`Every account's reorder rhythm, price list and territory, with a task when an order is late. Here is an example distributor's workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Bramley Trade Supply',
    tableObjectId: 'company',
    viewName: 'Reorder watch',
    columns: [
      { id: 'name', label: 'Account', width: 200, isFirstColumn: true },
      { id: 'territory', label: 'Territory', width: 140 },
      { id: 'usualCycle', label: 'Usual cycle', width: 130 },
      { id: 'lastOrder', label: 'Last order', width: 130 },
      { id: 'rhythm', label: 'Rhythm', width: 130 },
    ],
    rows: [
      accountRow(
        'corbin-hardware',
        'Corbin Hardware',
        'North East',
        '14 days',
        '19 days ago',
        { value: 'Overdue', color: 'red' },
      ),
      accountRow(
        'tillman-plumbing',
        'Tillman Plumbing',
        'North East',
        '7 days',
        '8 days ago',
        { value: 'Late', color: 'amber' },
      ),
      accountRow(
        'oakhurst-builders',
        'Oakhurst Builders Merchant',
        'Midlands',
        '21 days',
        '6 days ago',
        { value: 'On rhythm', color: 'green' },
      ),
      accountRow(
        'pell-electrical',
        'Pell Electrical',
        'South West',
        '10 days',
        '3 days ago',
        { value: 'On rhythm', color: 'green' },
      ),
      accountRow(
        'harwick-fixings',
        'Harwick Fixings',
        'Midlands',
        '30 days',
        '41 days ago',
        { value: 'Overdue', color: 'red' },
      ),
    ],
    record: {
      name: 'Corbin Hardware',
      createdAt: 'Added Jun 18',
      fields: [
        { label: 'Territory', value: { type: 'text', value: 'North East' } },
        { label: 'Price list', value: { type: 'text', value: 'Trade B' } },
        {
          label: 'Rhythm',
          value: { type: 'select', color: 'red', value: 'Overdue' },
        },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Priya Nandakumar', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`We notice a lost account a quarter too late.`,
      answer: msg`A daily workflow spots accounts past their usual cycle and gives the rep a task with a drafted note.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Each rep keeps reorder habits in their head.`,
      answer: msg`A reorder rhythm tab on every account shows the usual gap and how late the next order is.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Price changes reach customers by accident.`,
      answer: msg`Price lists are records linked to accounts, so you know exactly who a change affects.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Reps should only see their own territory.`,
      answer: msg`Row-level rules keep each rep to the accounts in their territory. Price list margins stay hidden.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'priceList',
      label: msg`Price lists`,
      purpose: msg`A set of prices and discounts that applies to a group of accounts.`,
      fields: [
        { label: msg`Tier` },
        { label: msg`Effective from` },
        { label: msg`Margin` },
        { label: msg`Accounts`, relatesTo: 'company' },
      ],
      previewIcon: 'coins',
      previewTone: 'amber',
    },
    {
      id: 'reorder',
      label: msg`Reorders`,
      purpose: msg`One order from a customer account, with its date, value and lines.`,
      fields: [
        { label: msg`Order date` },
        { label: msg`Value` },
        { label: msg`Lines` },
        { label: msg`Account`, relatesTo: 'company' },
        { label: msg`Price list`, relatesTo: 'priceList' },
      ],
      previewIcon: 'checkbox',
      previewTone: 'blue',
    },
    {
      id: 'territory',
      label: msg`Territories`,
      purpose: msg`A region with one rep and the accounts that rep looks after.`,
      fields: [
        { label: msg`Region` },
        { label: msg`Rep` },
        { label: msg`Accounts`, relatesTo: 'company' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'teal',
    },
  ],
  omittedObjectIds: ['dealer', 'asset', 'serviceVisit'],
  modelNotes: [
    {
      title: msg`Accounts carry their rhythm`,
      body: msg`The usual reorder cycle is a field on the account, so a late order shows the day it is late.`,
    },
    {
      title: msg`Price lists are records`,
      body: msg`Each account points to its price list, so a price change has a known list of customers.`,
    },
    MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE.dataModel.notes[2],
  ],
  workflows: [
    {
      title: msg`Reorder overdue`,
      outcome: msg`Reps call a quiet account while it is still a customer.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 06:00` },
        {
          kind: 'action',
          label: msg`Find accounts 20% past their usual reorder cycle`,
        },
        {
          kind: 'agent',
          label: msg`Draft a check-in note from recent orders`,
        },
        {
          kind: 'action',
          label: msg`Create a task for the rep with the draft`,
        },
      ],
    },
    {
      title: msg`Price list changed`,
      outcome: msg`Every affected account hears about new prices before its next order.`,
      steps: [
        { kind: 'trigger', label: msg`A price list is updated` },
        { kind: 'action', label: msg`Find the accounts on that price list` },
        {
          kind: 'action',
          label: msg`Email each account's buyer the new prices`,
        },
        { kind: 'action', label: msg`Add a note to each account` },
      ],
    },
    {
      title: msg`New territory assignment`,
      outcome: msg`Accounts that change territory never wait for a rep.`,
      steps: [
        { kind: 'trigger', label: msg`An account's territory is changed` },
        { kind: 'action', label: msg`Find the rep for the new territory` },
        { kind: 'action', label: msg`Set that rep as account owner` },
        {
          kind: 'action',
          label: msg`Create an introduction task for the new rep`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Reorder rhythm`,
    placedOn: 'company',
    description: msg`Shows an account's recent orders, the gap between each, and how late the next one is.`,
    preview: {
      tabLabel: 'Reorder rhythm',
      title: 'Reorder rhythm',
      caption: 'Usual cycle: 14 days',
      columns: ['Order', 'Placed', 'Gap', 'Value'],
      rows: [
        {
          id: 'next',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Next order' },
            { type: 'text', value: 'Expected Nov 20' },
            { type: 'select', color: 'red', value: '19 days so far' },
            { type: 'text', value: '—' },
          ],
        },
        {
          id: 'ro-48211',
          cells: [
            { type: 'text', value: 'RO-48211' },
            { type: 'text', value: 'Nov 6' },
            { type: 'select', color: 'green', value: '13 days' },
            { type: 'currency', value: '$4,820' },
          ],
        },
        {
          id: 'ro-47930',
          cells: [
            { type: 'text', value: 'RO-47930' },
            { type: 'text', value: 'Oct 24' },
            { type: 'select', color: 'green', value: '15 days' },
            { type: 'currency', value: '$5,140' },
          ],
        },
        {
          id: 'ro-47602',
          cells: [
            { type: 'text', value: 'RO-47602' },
            { type: 'text', value: 'Oct 9' },
            { type: 'select', color: 'green', value: '14 days' },
            { type: 'currency', value: '$4,690' },
          ],
        },
      ],
      footnote:
        'Corbin usually orders every 14 days. Priya has a task with a drafted note.',
    },
  },
  agents: {
    heading: msg`Agents that notice the quiet accounts. *Reps make the call*`,
    items: [
      {
        name: msg`Churn watcher`,
        job: msg`Reads an overdue account's recent reorders and drafts a check-in note for the rep.`,
        reads: ['company', 'reorder', 'priceList'],
        writes: ['task'],
        limit: msg`Creates tasks only and never contacts a customer.`,
      },
      {
        name: msg`Territory briefer`,
        job: msg`Summarizes order history and open issues for each account a rep takes over.`,
        reads: ['territory', 'company', 'reorder'],
        writes: ['note'],
        limit: msg`Writes notes only and cannot reassign an account.`,
      },
    ],
  },
  access: {
    heading: msg`Reps see their territory. *Margins stay inside*`,
    roles: [
      { id: 'salesRep', label: msg`Sales rep` },
      { id: 'territoryManager', label: msg`Territory manager` },
      { id: 'management', label: msg`Management` },
    ],
    rules: [
      {
        objectId: 'company',
        accessByRoleId: {
          salesRep: msg`Own territory, edit`,
          territoryManager: msg`Managed territories, edit`,
          management: msg`See and edit all`,
        },
      },
      {
        objectId: 'reorder',
        accessByRoleId: {
          salesRep: msg`Own territory, read only`,
          territoryManager: msg`Managed territories, read only`,
          management: msg`See all`,
        },
      },
      {
        objectId: 'priceList',
        accessByRoleId: {
          salesRep: msg`See prices, margins hidden`,
          territoryManager: msg`See prices, margins hidden`,
          management: msg`See and edit all`,
        },
      },
      {
        objectId: 'territory',
        accessByRoleId: {
          salesRep: msg`See own`,
          territoryManager: msg`Edit managed territories`,
          management: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Manufacturing Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Order', objectId: 'reorder' },
      { salesforceObject: 'Price Book', objectId: 'priceList' },
      { salesforceObject: 'Sales Agreement', objectId: 'salesAgreement' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  discovery: [
    {
      question: msg`How many accounts does each rep look after?`,
      shapes: msg`Sets the territories and each rep's views.`,
    },
    {
      question: msg`How often do your best accounts reorder?`,
      shapes: msg`Sets the usual cycle and when an order counts as overdue.`,
    },
    MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE.discovery[2],
    {
      question: msg`How many price lists do you run, and who changes them?`,
      shapes: msg`Decides the price list tiers and who can see margins.`,
    },
    {
      question: msg`Do key accounts commit to volumes up front?`,
      shapes: msg`Decides whether sales agreements carry a planned volume.`,
    },
  ],
  categoryQuestions: 'omit',
  questions: [
    {
      question: msg`How does it know an account's usual cycle?`,
      answer: msg`It is a field on the account. Set it by hand, or compute it from past reorders with a code step in a workflow.`,
    },
    {
      question: msg`Do orders have to be typed into Twenty?`,
      answer: msg`No. Push them from your ERP or order system through the API, or import them by CSV.`,
    },
    MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE.questions[0],
    MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE.questions[3],
  ],
  proof: { kind: 'none' },
};
