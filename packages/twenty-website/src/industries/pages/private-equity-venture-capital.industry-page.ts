import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const dealRow = (
  id: string,
  company: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'purple' },
  ticket: string,
  fund: string,
  dealLead: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'entity', name: company },
    stage: { type: 'select', ...stage },
    ticket: { type: 'currency', value: ticket },
    fund: { type: 'text', value: fund },
    dealLead: { type: 'person', name: dealLead, kind: 'person', tone: 'gray' },
  },
});

export const PRIVATE_EQUITY_VENTURE_CAPITAL_INDUSTRY_PAGE: IndustrySubCategoryPage =
  {
    kind: 'subCategory',
    slug: 'private-equity-venture-capital',
    parentSlug: 'financial-services',
    status: 'draft',
    name: msg`Private equity and venture capital`,
    meta: {
      title: msg`Twenty for private equity and venture capital firms`,
      description: msg`Track deal flow, funds, portfolio companies and limited partners in an open source CRM. See an example investment firm workspace built on Twenty.`,
    },
    hero: {
      headline: msg`Deal flow, portfolio and LPs *in one graph*`,
      body: msg`Deals, funds, portfolio companies and limited partners, linked to each other. Here is an example investment firm workspace built on Twenty.`,
    },
    preview: {
      workspaceName: 'Kestrel Ridge Capital',
      tableObjectId: 'deal',
      viewName: 'Deal flow',
      columns: [
        { id: 'name', label: 'Company', width: 190, isFirstColumn: true },
        { id: 'stage', label: 'Stage', width: 130 },
        { id: 'ticket', label: 'Ticket', width: 120, align: 'right' },
        { id: 'fund', label: 'Fund', width: 130 },
        { id: 'dealLead', label: 'Deal lead', width: 160 },
      ],
      rows: [
        dealRow(
          'lumen',
          'Lumenfield Robotics',
          { value: 'Diligence', color: 'amber' },
          '$12,000,000',
          'Fund III',
          'Clara Hoffmann',
        ),
        dealRow(
          'tidal',
          'Tidalwork',
          { value: 'First meeting', color: 'blue' },
          '$4,000,000',
          'Fund III',
          'Marcus Bell',
        ),
        dealRow(
          'orchard',
          'Orchard Ledger',
          { value: 'IC', color: 'purple' },
          '$18,500,000',
          'Growth I',
          'Clara Hoffmann',
        ),
        dealRow(
          'vantor',
          'Vantor Bio',
          { value: 'Closed', color: 'green' },
          '$9,000,000',
          'Fund III',
          'Sofia Ricci',
        ),
      ],
      record: {
        name: 'Orchard Ledger',
        createdAt: 'Added Aug 21',
        fields: [
          {
            label: 'Stage',
            value: { type: 'select', color: 'purple', value: 'IC' },
          },
          {
            label: 'Ticket',
            value: { type: 'currency', value: '$18,500,000' },
          },
          { label: 'Fund', value: { type: 'text', value: 'Growth I' } },
          {
            label: 'Deal lead',
            value: { type: 'person', name: 'Clara Hoffmann', kind: 'person' },
          },
        ],
      },
    },
    addedObjects: [
      {
        id: 'deal',
        label: msg`Deals`,
        purpose: msg`One investment opportunity, from first meeting to close.`,
        fields: [
          { label: msg`Stage` },
          { label: msg`Ticket size` },
          { label: msg`Company`, relatesTo: 'company' },
          { label: msg`Fund`, relatesTo: 'fund' },
        ],
        previewIcon: 'targetArrow',
        previewTone: 'purple',
      },
      {
        id: 'fund',
        label: msg`Funds`,
        purpose: msg`A vehicle with a size, a vintage and the capital left to deploy.`,
        fields: [
          { label: msg`Fund size` },
          { label: msg`Vintage` },
          { label: msg`Limited partners`, relatesTo: 'limitedPartner' },
        ],
        previewIcon: 'folder',
        previewTone: 'blue',
      },
      {
        id: 'portfolioCompany',
        label: msg`Portfolio companies`,
        purpose: msg`A company you own a stake in, with its board seat and metrics.`,
        fields: [
          { label: msg`Ownership` },
          { label: msg`Last valuation` },
          { label: msg`Fund`, relatesTo: 'fund' },
        ],
        previewIcon: 'buildingSkyscraper',
        previewTone: 'green',
      },
      {
        id: 'limitedPartner',
        label: msg`Limited partners`,
        purpose: msg`An investor in your funds, with commitments and reporting contacts.`,
        fields: [
          { label: msg`Commitment` },
          { label: msg`Reporting contact`, relatesTo: 'person' },
          { label: msg`Funds`, relatesTo: 'fund' },
        ],
        previewIcon: 'users',
        previewTone: 'teal',
      },
    ],
    workflows: [
      {
        title: msg`Deal moved to diligence`,
        outcome: msg`Every diligence starts with the same checklist and a partner who knows.`,
        steps: [
          { kind: 'trigger', label: msg`Deal stage changes to Diligence` },
          { kind: 'action', label: msg`Create the diligence checklist tasks` },
          { kind: 'action', label: msg`Email the partner on the fund` },
        ],
      },
      {
        title: msg`Quarterly LP update`,
        outcome: msg`LP letters start from the quarter's notes, not a blank page.`,
        steps: [
          { kind: 'trigger', label: msg`First day of each quarter` },
          { kind: 'action', label: msg`Find portfolio companies in each fund` },
          {
            kind: 'agent',
            label: msg`Draft the LP update from portfolio notes`,
          },
          { kind: 'action', label: msg`Create a review task for the partner` },
        ],
      },
      {
        title: msg`Portfolio metrics request`,
        outcome: msg`Founders report the same metrics every quarter, chased automatically.`,
        steps: [
          { kind: 'trigger', label: msg`Fifth day of each quarter` },
          { kind: 'action', label: msg`Find active portfolio companies` },
          { kind: 'action', label: msg`Email founders the metrics form` },
          { kind: 'action', label: msg`Create a task when no reply in 7 days` },
        ],
      },
    ],
    customScreen: {
      title: msg`IC memo checklist`,
      placedOn: 'deal',
      description: msg`Shows which sections of the investment committee memo are done before the deal goes to IC.`,
      preview: {
        tabLabel: 'IC memo',
        title: 'IC memo checklist',
        caption: '3 of 4 sections ready',
        columns: ['Section', 'Owner', 'Status'],
        rows: [
          {
            id: 'thesis',
            cells: [
              { type: 'text', value: 'Investment thesis' },
              { type: 'person', name: 'Clara Hoffmann', kind: 'person' },
              { type: 'select', color: 'green', value: 'Ready' },
            ],
          },
          {
            id: 'financials',
            cells: [
              { type: 'text', value: 'Financial model' },
              { type: 'person', name: 'Marcus Bell', kind: 'person' },
              { type: 'select', color: 'green', value: 'Ready' },
            ],
          },
          {
            id: 'references',
            highlighted: true,
            cells: [
              { type: 'text', value: 'Customer references' },
              { type: 'person', name: 'Sofia Ricci', kind: 'person' },
              { type: 'select', color: 'amber', value: 'In progress' },
            ],
          },
          {
            id: 'legal',
            cells: [
              { type: 'text', value: 'Legal review' },
              { type: 'person', name: 'Marcus Bell', kind: 'person' },
              { type: 'select', color: 'green', value: 'Ready' },
            ],
          },
        ],
        footnote: 'Two customer references are still to be called.',
      },
    },
    questions: [
      {
        question: msg`We track deal flow in a spreadsheet.`,
        answer: msg`Import it by CSV. Each row becomes a deal linked to its company and fund.`,
      },
      {
        question: msg`Can LPs see their own reports?`,
        answer: msg`LP updates go out by email from Twenty. [Confirm whether an LP portal is in scope.]`,
      },
    ],
  };
