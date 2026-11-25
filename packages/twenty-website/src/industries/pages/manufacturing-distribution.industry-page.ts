import { msg } from '@lingui/core/macro';
import { IconBuildingFactory2 } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const assetRow = (
  id: string,
  name: string,
  account: string,
  installedOn: string,
  nextService: { value: string; color: 'amber' | 'green' | 'red' | 'gray' },
  dealer: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    account: { type: 'entity', name: account },
    installedOn: { type: 'text', value: installedOn },
    nextService: { type: 'select', ...nextService },
    dealer: { type: 'entity', name: dealer },
  },
});

export const MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'manufacturing-distribution',
  status: 'draft',
  name: msg`Manufacturing and distribution`,
  menu: {
    description: msg`Dealers, agreements and assets`,
    icon: IconBuildingFactory2,
  },
  meta: {
    title: msg`Twenty for manufacturing and distribution — a CRM built around dealers and installed equipment`,
    description: msg`Model dealers, sales agreements, installed assets and service visits in an open source CRM. See an example equipment maker's workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every dealer, every agreement, *every machine in the field*`,
    body: msg`Installed assets, dealer territories and sales agreements, not just contacts and deals. Here is an example equipment maker's workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ostrander Machinery',
    tableObjectId: 'asset',
    viewName: 'Installed base',
    columns: [
      { id: 'name', label: 'Asset', width: 200, isFirstColumn: true },
      { id: 'account', label: 'Account', width: 180 },
      { id: 'installedOn', label: 'Installed', width: 120 },
      { id: 'nextService', label: 'Next service', width: 140 },
      { id: 'dealer', label: 'Dealer', width: 170 },
    ],
    rows: [
      assetRow(
        'hx-40112',
        'HX-200 Crusher · 40112',
        'Brightwater Aggregates',
        'Mar 2021',
        { value: 'Overdue', color: 'red' },
        'Northfield Equipment',
      ),
      assetRow(
        'cv-18845',
        'CV-90 Conveyor · 18845',
        'Brightwater Aggregates',
        'Jun 2023',
        { value: 'In 12 days', color: 'amber' },
        'Northfield Equipment',
      ),
      assetRow(
        'sx-22071',
        'SX-60 Screener · 22071',
        'Calder Quarries',
        'Jan 2024',
        { value: 'Apr 2027', color: 'green' },
        'Redline Machinery',
      ),
      assetRow(
        'hx-39876',
        'HX-200 Crusher · 39876',
        'Pinecrest Recycling',
        'Sep 2019',
        { value: 'In 20 days', color: 'amber' },
        'Coastal Plant Hire',
      ),
      assetRow(
        'cv-17302',
        'CV-90 Conveyor · 17302',
        'Calder Quarries',
        'Nov 2020',
        { value: 'Feb 2027', color: 'green' },
        'Redline Machinery',
      ),
      assetRow(
        'sx-20514',
        'SX-60 Screener · 20514',
        'Halden Minerals',
        'May 2018',
        { value: 'Retired', color: 'gray' },
        'Coastal Plant Hire',
      ),
    ],
    record: {
      name: 'Brightwater Aggregates',
      createdAt: 'Added Feb 14',
      fields: [
        {
          label: 'Dealer',
          value: { type: 'text', value: 'Northfield Equipment' },
        },
        { label: 'Assets installed', value: { type: 'text', value: '7' } },
        {
          label: 'Agreement',
          value: { type: 'select', color: 'amber', value: 'Under plan' },
        },
        {
          label: 'Account owner',
          value: { type: 'person', name: 'Daniel Brandt', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`We sell the machine once and lose track of it.`,
      answer: msg`Asset is its own object, linked to the account, the site and every service visit.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Our dealers run their own spreadsheets.`,
      answer: msg`Dealers get seats with a dealer role, limited to their territory and accounts.`,
      answeredBy: 'access',
    },
    {
      complaint: msg`Forecasts come from agreements, not deals.`,
      answer: msg`A monthly workflow compares orders with each agreement and alerts the owner.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We have product lines that don't fit one pipeline.`,
      answer: msg`NetZero runs three product lines across several countries on one Twenty workspace.`,
      answeredBy: 'proof',
    },
  ],
  dataModel: {
    heading: msg`Model the business *from the factory to the field*`,
    objects: [
      {
        id: 'dealer',
        label: msg`Dealers`,
        purpose: msg`An independent partner that sells and services in a territory.`,
        fields: [
          { label: msg`Territory` },
          { label: msg`Contract ends` },
          { label: msg`Accounts`, relatesTo: 'company' },
        ],
        previewIcon: 'briefcase',
        previewTone: 'blue',
      },
      {
        id: 'salesAgreement',
        label: msg`Sales agreements`,
        purpose: msg`A long-term commitment with planned volumes, prices and a term.`,
        fields: [
          { label: msg`Planned volume per month` },
          { label: msg`Term ends` },
          { label: msg`Account`, relatesTo: 'company' },
          { label: msg`Product line`, relatesTo: 'productLine' },
        ],
        previewIcon: 'fileText',
        previewTone: 'purple',
      },
      {
        id: 'asset',
        label: msg`Assets`,
        purpose: msg`One machine installed at a customer site, with its serial number.`,
        fields: [
          { label: msg`Serial number` },
          { label: msg`Installed on` },
          { label: msg`Service interval` },
          { label: msg`Account`, relatesTo: 'company' },
          { label: msg`Dealer`, relatesTo: 'dealer' },
        ],
        previewIcon: 'tag',
        previewTone: 'orange',
      },
      {
        id: 'serviceVisit',
        label: msg`Service visits`,
        purpose: msg`One visit to one asset, with the work done and the next due date.`,
        fields: [
          { label: msg`Visit date` },
          { label: msg`Work done` },
          { label: msg`Asset`, relatesTo: 'asset' },
        ],
        previewIcon: 'calendarEvent',
        previewTone: 'green',
      },
      {
        id: 'productLine',
        label: msg`Product lines`,
        purpose: msg`A family of products with its own stages, pricing and team.`,
        fields: [
          { label: msg`Stages` },
          { label: msg`Margin target` },
          { label: msg`Agreements`, relatesTo: 'salesAgreement' },
        ],
        previewIcon: 'folder',
        previewTone: 'gray',
      },
    ],
    notes: [
      {
        title: msg`Assets outlive the sale`,
        body: msg`The machine stays on the account after the deal closes, with its site and service history.`,
      },
      {
        title: msg`Dealers are records`,
        body: msg`Each dealer has a territory, its accounts and its own seats, instead of a spreadsheet.`,
      },
      {
        title: msg`Agreements carry the forecast`,
        body: msg`Planned volume lives on the agreement, so actual orders can be compared against it.`,
      },
    ],
  },
  workflows: {
    heading: msg`The routine runs itself. *Your team keeps the accounts*`,
    items: [
      {
        title: msg`Agreement under plan`,
        outcome: msg`Owners hear about a shortfall the month it happens.`,
        steps: [
          { kind: 'trigger', label: msg`On the 1st of every month` },
          {
            kind: 'action',
            label: msg`Fetch last month's orders from the ERP export`,
          },
          {
            kind: 'action',
            label: msg`Compare orders with each agreement's plan`,
          },
          {
            kind: 'action',
            label: msg`Email the owner of agreements under plan`,
          },
        ],
      },
      {
        title: msg`Service due`,
        outcome: msg`No machine runs past its service interval unnoticed.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 07:00` },
          {
            kind: 'action',
            label: msg`Find assets that reached their service interval`,
          },
          { kind: 'action', label: msg`Create a service visit` },
          { kind: 'action', label: msg`Notify the dealer for that territory` },
        ],
      },
      {
        title: msg`New dealer lead`,
        outcome: msg`Web enquiries reach the right dealer the same day.`,
        steps: [
          { kind: 'trigger', label: msg`Web enquiry arrives by webhook` },
          {
            kind: 'action',
            label: msg`Find the dealer for the enquiry's territory`,
          },
          {
            kind: 'action',
            label: msg`Create the account and assign the dealer`,
          },
          { kind: 'action', label: msg`Email the dealer the enquiry` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that prepare the review. *People run it*`,
    items: [
      {
        name: msg`Account reviewer`,
        job: msg`Summarizes agreements, assets and open service issues before a quarterly review.`,
        reads: ['company', 'salesAgreement', 'asset', 'serviceVisit'],
        writes: ['note'],
        limit: msg`Writes notes only and cannot change an agreement.`,
      },
    ],
  },
  customScreen: {
    title: msg`Installed base`,
    placedOn: 'company',
    description: msg`Shows every asset on the account by site, with its age and next service date.`,
    preview: {
      tabLabel: 'Installed base',
      title: 'Installed base',
      caption: 'By site, next service first',
      columns: ['Asset', 'Site', 'Age', 'Next service'],
      rows: [
        {
          id: 'hx-40112',
          highlighted: true,
          cells: [
            { type: 'text', value: 'HX-200 Crusher · 40112' },
            { type: 'text', value: 'Ridge Pit' },
            { type: 'text', value: '5 years' },
            { type: 'select', color: 'red', value: 'Overdue' },
          ],
        },
        {
          id: 'cv-18845',
          cells: [
            { type: 'text', value: 'CV-90 Conveyor · 18845' },
            { type: 'text', value: 'Ridge Pit' },
            { type: 'text', value: '3 years' },
            { type: 'select', color: 'amber', value: 'In 12 days' },
          ],
        },
        {
          id: 'sx-23390',
          cells: [
            { type: 'text', value: 'SX-60 Screener · 23390' },
            { type: 'text', value: 'Hollow Creek' },
            { type: 'text', value: '1 year' },
            { type: 'select', color: 'green', value: 'Jun 2027' },
          ],
        },
      ],
      footnote:
        'One crusher at Ridge Pit is overdue. Northfield has been notified.',
    },
  },
  access: {
    heading: msg`Dealers see their territory. *Margins stay inside*`,
    roles: [
      { id: 'sales', label: msg`Sales` },
      { id: 'dealer', label: msg`Dealer` },
      { id: 'management', label: msg`Management` },
    ],
    rules: [
      {
        objectId: 'company',
        accessByRoleId: {
          sales: msg`See and edit all`,
          dealer: msg`Own territory only`,
          management: msg`See and edit all`,
        },
      },
      {
        objectId: 'asset',
        accessByRoleId: {
          sales: msg`See all`,
          dealer: msg`Own territory, edit service fields`,
          management: msg`See and edit all`,
        },
      },
      {
        objectId: 'salesAgreement',
        accessByRoleId: {
          sales: msg`See and edit all`,
          dealer: msg`Own territory, prices hidden`,
          management: msg`See and edit all`,
        },
      },
      {
        objectId: 'productLine',
        accessByRoleId: {
          sales: msg`See all, margins hidden`,
          dealer: msg`See names only`,
          management: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Manufacturing Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Sales Agreement', objectId: 'salesAgreement' },
      { salesforceObject: 'Asset', objectId: 'asset' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  proof: { kind: 'caseStudy', caseStudySlug: 'netzero' },
  questions: [
    {
      question: msg`Can it connect to our ERP?`,
      answer: msg`There is no packaged ERP connector. Use the REST or GraphQL API, or a scheduled workflow that calls your ERP over HTTP.`,
    },
    {
      question: msg`Our dealers are outside the company.`,
      answer: msg`Give them seats with a dealer role. Row-level rules keep each dealer to their own territory and accounts.`,
    },
    {
      question: msg`Can we bring our installed base with us?`,
      answer: msg`Import assets by CSV, then keep them current through the API or a scheduled workflow.`,
    },
    {
      question: msg`Who owns our data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`Do you sell direct, through dealers, or both?`,
      shapes: msg`Sets the dealer object, its roles and the lead routing workflow.`,
    },
    {
      question: msg`Do you track equipment after the sale?`,
      shapes: msg`Decides how much of the asset and service model to build.`,
    },
    {
      question: msg`Where do orders live today?`,
      shapes: msg`Sets how the ERP export reaches Twenty.`,
    },
    {
      question: msg`How do you forecast?`,
      shapes: msg`Agreements, deals or both shape the pipeline and the monthly check.`,
    },
    {
      question: msg`How many product lines do you sell?`,
      shapes: msg`Each line can get its own stages and views.`,
    },
  ],
};
