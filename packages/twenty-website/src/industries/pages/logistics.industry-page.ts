import { msg } from '@lingui/core/macro';
import { IconTruck } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const quoteRow = (
  id: string,
  name: string,
  shipper: string,
  lane: string,
  rate: string,
  expires: { value: string; color: 'red' | 'amber' | 'green' | 'gray' },
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: 'Q', tone: 'teal' },
    shipper: { type: 'entity', name: shipper },
    lane: { type: 'text', value: lane },
    rate: { type: 'currency', value: rate },
    expires: { type: 'select', ...expires },
  },
});

export const LOGISTICS_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'logistics',
  status: 'draft',
  name: msg`Logistics`,
  menu: { description: msg`Lanes, quotes and shipments`, icon: IconTruck },
  meta: {
    title: msg`Twenty for logistics — a CRM built around lanes, rates and shipments`,
    description: msg`Model lanes, rate quotes, tenders and shipment volumes in an open source CRM connected to your TMS. See an example freight workspace built on Twenty.`,
  },
  hero: {
    headline: msg`A CRM that knows *lanes, rates and shipments*`,
    body: msg`Lanes, rate quotes, tenders and the volumes your TMS records, instead of opportunities and spreadsheets of quotes. Here is an example freight workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Corvane Logistics',
    tableObjectId: 'rateQuote',
    viewName: 'Open quotes',
    columns: [
      { id: 'name', label: 'Quote', width: 130, isFirstColumn: true },
      { id: 'shipper', label: 'Shipper', width: 180 },
      { id: 'lane', label: 'Lane', width: 200 },
      { id: 'rate', label: 'Rate', width: 130 },
      { id: 'expires', label: 'Valid until', width: 150 },
    ],
    rows: [
      quoteRow(
        'q-4182',
        'Q-4182',
        'Ostley Home Goods',
        'Rotterdam → Chicago',
        '$3,450 / FEU',
        { value: 'In 2 days', color: 'red' },
      ),
      quoteRow(
        'q-4179',
        'Q-4179',
        'Bramford Foods',
        'Shanghai → Hamburg',
        '$2,180 / FEU',
        { value: 'In 6 days', color: 'amber' },
      ),
      quoteRow(
        'q-4171',
        'Q-4171',
        'Pellworth Tools',
        'Lyon → Milan',
        '$1,320 / FTL',
        { value: 'Dec 31', color: 'green' },
      ),
      quoteRow(
        'q-4166',
        'Q-4166',
        'Ostley Home Goods',
        'Rotterdam → Toronto',
        '$3,910 / FEU',
        { value: 'Dec 18', color: 'green' },
      ),
      quoteRow(
        'q-4150',
        'Q-4150',
        'Kinnear Apparel',
        'Ho Chi Minh City → Felixstowe',
        '$2,640 / FEU',
        { value: 'Expired', color: 'gray' },
      ),
    ],
    record: {
      name: 'Rotterdam → Chicago',
      createdAt: 'Added Mar 3',
      fields: [
        {
          label: 'Mode',
          value: { type: 'select', color: 'blue', value: 'Ocean FCL' },
        },
        { label: 'Volume per year', value: { type: 'text', value: '420 FEU' } },
        { label: 'Shippers on lane', value: { type: 'text', value: '3' } },
        {
          label: 'Lane owner',
          value: { type: 'person', name: 'Ines Kowal', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Quotes live in spreadsheets and inboxes.`,
      answer: msg`Every quote sits on its lane, so a rep compares carrier rates on one screen before answering.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`We find out a customer left when volumes drop.`,
      answer: msg`A quarterly workflow compares each shipper's volume with the last quarter and opens an account review.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Our TMS knows the shipments, our CRM knows nothing.`,
      answer: msg`Shipments reach Twenty through the API, webhooks or a scheduled call to your TMS.`,
      answeredBy: 'questions',
    },
    {
      complaint: msg`Annual RFQs take weeks.`,
      answer: msg`An agent reads the tender, matches each lane to its history and drafts the rates for review.`,
      answeredBy: 'agents',
    },
  ],
  dataModel: {
    heading: msg`Model the business *lane by lane*`,
    objects: [
      {
        id: 'lane',
        label: msg`Lanes`,
        purpose: msg`One origin and destination, with its mode and yearly volume.`,
        fields: [
          { label: msg`Origin` },
          { label: msg`Destination` },
          { label: msg`Mode` },
          { label: msg`Volume per year` },
        ],
        previewIcon: 'mapPin',
        previewTone: 'blue',
      },
      {
        id: 'rateQuote',
        label: msg`Rate quotes`,
        purpose: msg`A rate offered to a shipper on one lane, valid until a date.`,
        fields: [
          { label: msg`Sell rate` },
          { label: msg`Buy rate` },
          { label: msg`Valid until` },
          { label: msg`Lane`, relatesTo: 'lane' },
          { label: msg`Shipper`, relatesTo: 'company' },
          { label: msg`Carrier`, relatesTo: 'carrier' },
        ],
        previewIcon: 'coins',
        previewTone: 'teal',
      },
      {
        id: 'shipment',
        label: msg`Shipments`,
        purpose: msg`One move recorded in the TMS, kept in sync for volume and revenue.`,
        fields: [
          { label: msg`TMS reference` },
          { label: msg`Shipped on` },
          { label: msg`Revenue` },
          { label: msg`Lane`, relatesTo: 'lane' },
          { label: msg`Shipper`, relatesTo: 'company' },
        ],
        previewIcon: 'tag',
        previewTone: 'orange',
      },
      {
        id: 'contract',
        label: msg`Contracts and tenders`,
        purpose: msg`An annual tender or signed rate agreement covering many lanes.`,
        fields: [
          { label: msg`Stage` },
          { label: msg`Rates valid until` },
          { label: msg`Shipper`, relatesTo: 'company' },
          { label: msg`Lanes`, relatesTo: 'lane' },
        ],
        previewIcon: 'fileText',
        previewTone: 'purple',
      },
      {
        id: 'carrier',
        label: msg`Carriers`,
        purpose: msg`A line, airline or trucking company you buy capacity from.`,
        fields: [
          { label: msg`Modes` },
          { label: msg`Contract rates until` },
          { label: msg`Lanes served`, relatesTo: 'lane' },
        ],
        previewIcon: 'buildingSkyscraper',
        previewTone: 'gray',
      },
    ],
    notes: [
      {
        title: msg`Lanes are records`,
        body: msg`Each lane keeps its quotes, carriers and shipments, so the next rate starts from its history.`,
      },
      {
        title: msg`Quotes expire`,
        body: msg`A valid-until date on every quote lets workflows chase it before the rate lapses.`,
      },
      {
        title: msg`Shipments come from the TMS`,
        body: msg`The TMS stays the system of record. Twenty keeps the volume per shipper and lane.`,
      },
    ],
  },
  workflows: {
    heading: msg`The paperwork runs itself. *Your team keeps the shippers*`,
    items: [
      {
        title: msg`RFQ intake`,
        outcome: msg`Every lane in an RFQ becomes a draft quote the day it arrives.`,
        steps: [
          { kind: 'trigger', label: msg`RFQ arrives by webhook` },
          { kind: 'agent', label: msg`Extract the lanes and volumes` },
          { kind: 'action', label: msg`Create a draft quote for each lane` },
          {
            kind: 'action',
            label: msg`Assign the quotes to the account owner`,
          },
        ],
      },
      {
        title: msg`Quote about to expire`,
        outcome: msg`No rate lapses before the rep has followed up.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find quotes that expire in 3 days` },
          { kind: 'action', label: msg`Email the rep a reminder` },
        ],
      },
      {
        title: msg`Volume drop`,
        outcome: msg`Owners see a shipper slipping before the volume is gone.`,
        steps: [
          { kind: 'trigger', label: msg`On the 1st of every quarter` },
          {
            kind: 'action',
            label: msg`Fetch shipment volumes from the TMS export`,
          },
          {
            kind: 'action',
            label: msg`Compare each shipper with last quarter`,
          },
          {
            kind: 'action',
            label: msg`Create an account review task for drops`,
          },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that draft the rates. *People set the price*`,
    items: [
      {
        name: msg`Quote desk`,
        job: msg`Drafts a rate for a new request from the lane's past quotes, carrier costs and won business.`,
        reads: ['lane', 'rateQuote', 'carrier', 'shipment'],
        writes: ['rateQuote', 'note'],
        limit: msg`Writes draft quotes only. A rep reviews and sends every rate.`,
      },
      {
        name: msg`Tender reader`,
        job: msg`Summarizes an annual tender and flags lanes with no history or thin margins.`,
        reads: ['contract', 'lane', 'rateQuote'],
        writes: ['note', 'task'],
        limit: msg`Writes notes and tasks only and cannot change a contract.`,
      },
    ],
  },
  customScreen: {
    title: msg`Quote comparison`,
    placedOn: 'lane',
    description: msg`Lines up every carrier rate on the lane with transit time and validity, cheapest first.`,
    preview: {
      tabLabel: 'Quote comparison',
      title: 'Quote comparison',
      caption: 'Carrier rates on this lane, cheapest first',
      columns: ['Carrier', 'Transit', 'Buy rate', 'Valid until'],
      rows: [
        {
          id: 'northsea',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Northsea Line' },
            { type: 'text', value: '19 days' },
            { type: 'currency', value: '$2,870' },
            { type: 'select', color: 'amber', value: 'Fri' },
          ],
        },
        {
          id: 'bluewater',
          cells: [
            { type: 'text', value: 'Bluewater Container' },
            { type: 'text', value: '17 days' },
            { type: 'currency', value: '$3,040' },
            { type: 'select', color: 'green', value: 'Dec 31' },
          ],
        },
        {
          id: 'meridia',
          cells: [
            { type: 'text', value: 'Meridia Shipping' },
            { type: 'text', value: '22 days' },
            { type: 'currency', value: '$3,110' },
            { type: 'select', color: 'green', value: 'Jan 15' },
          ],
        },
      ],
      footnote: 'Northsea is cheapest, but its rate expires on Friday.',
    },
  },
  access: {
    heading: msg`Reps see their accounts. *Margins stay with managers*`,
    roles: [
      { id: 'rep', label: msg`Sales rep` },
      { id: 'pricing', label: msg`Pricing desk` },
      { id: 'manager', label: msg`Manager` },
    ],
    rules: [
      {
        objectId: 'company',
        accessByRoleId: {
          rep: msg`Own accounts only`,
          pricing: msg`See all`,
          manager: msg`See and edit all`,
        },
      },
      {
        objectId: 'rateQuote',
        accessByRoleId: {
          rep: msg`Own accounts, buy rate hidden`,
          pricing: msg`See and edit all`,
          manager: msg`See and edit all`,
        },
      },
      {
        objectId: 'shipment',
        accessByRoleId: {
          rep: msg`Own accounts, read only`,
          pricing: msg`See all, read only`,
          manager: msg`See all, read only`,
        },
      },
      {
        objectId: 'carrier',
        accessByRoleId: {
          rep: msg`See names only`,
          pricing: msg`See and edit all`,
          manager: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Opportunity', objectId: 'contract' },
      { salesforceObject: 'Quote', objectId: 'rateQuote' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API. Quote spreadsheets import the same way.`,
  },
  proof: { kind: 'none' },
  questions: [
    {
      question: msg`Can it connect to our TMS?`,
      answer: msg`There is no packaged TMS connector. Use the REST or GraphQL API, webhooks, or a scheduled workflow that calls your TMS over HTTP.`,
    },
    {
      question: msg`Can we bring our quote spreadsheets?`,
      answer: msg`Yes. Import lanes and quotes by CSV, then keep new quotes in Twenty.`,
    },
    {
      question: msg`Reps should not see carrier costs.`,
      answer: msg`Field-level permissions hide buy rates and margins from reps. Managers and the pricing desk see them.`,
    },
    {
      question: msg`We run ocean, air and road.`,
      answer: msg`Mode is a field on the lane, so each mode gets its own views without separate objects.`,
    },
    {
      question: msg`Who owns our data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`How many active lanes do you quote?`,
      shapes: msg`Sets how lanes are keyed and which views the pricing desk needs.`,
    },
    {
      question: msg`Which modes do you sell?`,
      shapes: msg`Decides the mode values, rate units and any mode-specific objects.`,
    },
    {
      question: msg`How many RFQs do you answer a year?`,
      shapes: msg`Sizes the RFQ intake workflow and the tender agent.`,
    },
    {
      question: msg`Which TMS do you run, and can it export?`,
      shapes: msg`Sets how shipments reach Twenty: API, webhook or scheduled export.`,
    },
    {
      question: msg`Who can approve a rate below target margin?`,
      shapes: msg`Shapes the roles, the hidden fields and any approval step.`,
    },
  ],
};
