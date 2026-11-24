import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const listingRow = (
  id: string,
  name: string,
  status: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  askingPrice: string,
  mandateEnds: string,
  agent: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'purple' },
    status: { type: 'select', ...status },
    askingPrice: { type: 'currency', value: askingPrice },
    mandateEnds: { type: 'text', value: mandateEnds },
    agent: { type: 'person', name: agent, kind: 'person', tone: 'gray' },
  },
});

export const REAL_ESTATE_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'real-estate',
  status: 'draft',
  name: msg`Real estate`,
  meta: {
    title: msg`Twenty for real estate — a CRM built around listings and offers`,
    description: msg`Model properties, listings, buyer searches, viewings and offers in an open source CRM. See an example agency workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Build the CRM your agency *would have designed itself*`,
    body: msg`Listings, viewings and conditional offers, not contacts and deals. Here is an example agency workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Harbor & Hale',
    tableObjectId: 'listing',
    viewName: 'All Listings',
    columns: [
      { id: 'name', label: 'Listing', width: 190, isFirstColumn: true },
      { id: 'status', label: 'Status', width: 130 },
      { id: 'askingPrice', label: 'Asking price', width: 130, align: 'right' },
      { id: 'mandateEnds', label: 'Mandate ends', width: 140 },
      { id: 'agent', label: 'Listing agent', width: 160 },
    ],
    rows: [
      listingRow(
        'alder',
        '14 Alder Lane',
        { value: 'Under offer', color: 'amber' },
        '$1,250,000',
        'In 14 days',
        'Maya Okafor',
      ),
      listingRow(
        'quarry',
        '3 Quarry Road',
        { value: 'Live', color: 'green' },
        '$865,000',
        'Mar 2, 2027',
        'Tom Reyes',
      ),
      listingRow(
        'mill',
        '27 Mill Street',
        { value: 'Live', color: 'green' },
        '$1,040,000',
        'Feb 18, 2027',
        'Priya Nair',
      ),
      listingRow(
        'wharf',
        'Flat 6, The Wharf',
        { value: 'Coming soon', color: 'blue' },
        '$720,000',
        'Apr 9, 2027',
        'Maya Okafor',
      ),
      listingRow(
        'kings',
        '88 Kings Parade',
        { value: 'Sold', color: 'gray' },
        '$2,310,000',
        'Closed',
        'Priya Nair',
      ),
      listingRow(
        'fern',
        '12 Fern Close',
        { value: 'Live', color: 'green' },
        '$615,000',
        'In 21 days',
        'Tom Reyes',
      ),
    ],
    record: {
      name: '14 Alder Lane',
      createdAt: 'Added Oct 31',
      fields: [
        {
          label: 'Status',
          value: { type: 'select', color: 'amber', value: 'Under offer' },
        },
        {
          label: 'Asking price',
          value: { type: 'currency', value: '$1,250,000' },
        },
        { label: 'Mandate ends', value: { type: 'text', value: 'In 14 days' } },
        {
          label: 'Listing agent',
          value: { type: 'person', name: 'Maya Okafor', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Our CRM thinks a viewing is a task.`,
      answer: msg`Viewing is its own object, linking one buyer, one listing and an outcome.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`We pick the highest offer and it falls through.`,
      answer: msg`Offers carry financing and conditions, ranked on the listing page.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Mandates expire and nobody notices.`,
      answer: msg`A daily workflow finds mandates ending soon and briefs the agent.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Our agents keep their buyers on their phones.`,
      answer: msg`Buyer searches are records, private to each agent.`,
      answeredBy: 'access',
    },
  ],
  dataModel: {
    heading: msg`Model the business *the way agents talk about it*`,
    objects: [
      {
        id: 'property',
        label: msg`Properties`,
        purpose: msg`The physical asset. It exists before and after any sale.`,
        fields: [
          { label: msg`Address` },
          { label: msg`Floor area` },
          { label: msg`Owners`, relatesTo: 'person' },
        ],
        previewIcon: 'home',
        previewTone: 'orange',
      },
      {
        id: 'listing',
        label: msg`Listings`,
        purpose: msg`One mandate to sell a property, with a start and an end.`,
        fields: [
          { label: msg`Asking price` },
          { label: msg`Mandate ends` },
          { label: msg`Property`, relatesTo: 'property' },
        ],
        previewIcon: 'tag',
        previewTone: 'purple',
      },
      {
        id: 'search',
        label: msg`Searches`,
        purpose: msg`What a buyer is looking for, as fields instead of notes.`,
        fields: [
          { label: msg`Budget` },
          { label: msg`Areas` },
          { label: msg`Buyer`, relatesTo: 'person' },
        ],
        previewIcon: 'search',
        previewTone: 'teal',
      },
      {
        id: 'viewing',
        label: msg`Viewings`,
        purpose: msg`One buyer at one listing at one time, with an outcome.`,
        fields: [
          { label: msg`Starts at` },
          { label: msg`Outcome` },
          { label: msg`Listing`, relatesTo: 'listing' },
        ],
        previewIcon: 'calendarEvent',
        previewTone: 'green',
      },
      {
        id: 'offer',
        label: msg`Offers`,
        purpose: msg`A price with financing, conditions and an expiry.`,
        fields: [
          { label: msg`Amount` },
          { label: msg`Financing` },
          { label: msg`Expires at` },
          { label: msg`Listing`, relatesTo: 'listing' },
        ],
        previewIcon: 'coins',
        previewTone: 'amber',
      },
    ],
    notes: [
      {
        title: msg`Properties outlive listings`,
        body: msg`The same house comes back to market. Its history and past buyers stay attached.`,
      },
      {
        title: msg`A search is structured demand`,
        body: msg`Budget and areas as fields, so a new listing can be matched to every open buyer.`,
      },
      {
        title: msg`Rules keep data honest`,
        body: msg`An offer cannot be saved without an expiry date.`,
      },
    ],
  },
  workflows: {
    heading: msg`The routine runs itself. *Agents keep the judgment*`,
    items: [
      {
        title: msg`Viewing follow-up`,
        outcome: msg`Sellers hear back after every viewing.`,
        steps: [
          { kind: 'trigger', label: msg`Viewing outcome is set` },
          { kind: 'action', label: msg`Ask the agent for feedback` },
          { kind: 'agent', label: msg`Summarize the feedback for the seller` },
        ],
      },
      {
        title: msg`Mandate expiry watch`,
        outcome: msg`No mandate lapses without a renewal call.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find mandates ending within 14 days` },
          { kind: 'agent', label: msg`Write a renewal brief` },
          { kind: 'action', label: msg`Create a task for the listing agent` },
        ],
      },
      {
        title: msg`Offer expiry alert`,
        outcome: msg`No offer lapses because nobody checked a date.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find offers expiring within 48 hours` },
          { kind: 'action', label: msg`Notify the listing agent` },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that prepare the work. *People approve it*`,
    items: [
      {
        name: msg`Deal desk`,
        job: msg`Summarizes the offers on a listing and drafts the vendor update.`,
        reads: ['listing', 'offer', 'viewing'],
        writes: ['note'],
        limit: msg`Drafts emails but cannot send them.`,
      },
      {
        name: msg`Matchmaker`,
        job: msg`Ranks open searches against a new listing and creates call tasks.`,
        reads: ['listing', 'search', 'viewing'],
        writes: ['task'],
        limit: msg`Cannot read commissions.`,
      },
    ],
  },
  customScreen: {
    title: msg`Offer comparison`,
    placedOn: 'listing',
    description: msg`Ranks offers by certainty, weighing financing and conditions, not just price.`,
    preview: {
      tabLabel: 'Offers',
      title: 'Offer comparison',
      caption: 'Ranked by certainty',
      columns: ['Buyer', 'Offer', 'Financing', 'Conditions'],
      rows: [
        {
          id: 'chen',
          highlighted: true,
          cells: [
            { type: 'person', name: 'Chen family', kind: 'person' },
            { type: 'currency', value: '$1,240,000' },
            { type: 'select', color: 'green', value: 'Cash' },
            { type: 'text', value: 'None, 30 days' },
          ],
        },
        {
          id: 'brooks',
          cells: [
            { type: 'person', name: 'A. Brooks', kind: 'person' },
            { type: 'currency', value: '$1,265,000' },
            { type: 'select', color: 'blue', value: 'Pre-approved' },
            { type: 'text', value: 'Inspection, 60 days' },
          ],
        },
        {
          id: 'patel',
          cells: [
            { type: 'person', name: 'Patel', kind: 'person' },
            { type: 'currency', value: '$1,275,000' },
            { type: 'select', color: 'gray', value: 'Not approved' },
            { type: 'text', value: 'Sale of own home, 90 days' },
          ],
        },
      ],
      footnote:
        'Chen is $35,000 under the top offer, with nothing that can fall through.',
    },
  },
  access: {
    heading: msg`Agents keep their book. *The principal sees the firm*`,
    roles: [
      { id: 'agent', label: msg`Agent` },
      { id: 'manager', label: msg`Office manager` },
      { id: 'principal', label: msg`Principal` },
    ],
    rules: [
      {
        objectId: 'listing',
        accessByRoleId: {
          agent: msg`See all, edit own`,
          manager: msg`See and edit all`,
          principal: msg`See and edit all`,
        },
      },
      {
        objectId: 'search',
        accessByRoleId: {
          agent: msg`Own only`,
          manager: msg`Own office`,
          principal: msg`See all`,
        },
      },
      {
        objectId: 'offer',
        accessByRoleId: {
          agent: msg`On own listings`,
          manager: msg`See and edit all`,
          principal: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Opportunity', objectId: 'listing' },
      { salesforceObject: 'Opportunity', objectId: 'offer' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  proof: { kind: 'caseStudy', caseStudySlug: '9dots' },
  questions: [
    {
      question: msg`We already pay for a real estate CRM.`,
      answer: msg`Packaged tools decide your process for you. Twenty starts from your process, and you own the result.`,
    },
    {
      question: msg`Our agents live in WhatsApp.`,
      answer: msg`Keep it. Homeseller's chats feed Twenty through the API, and some agents never open the CRM.`,
    },
    {
      question: msg`What about listing portals?`,
      answer: msg`Every object has a REST and GraphQL API, and workflows can call any HTTP endpoint.`,
    },
    {
      question: msg`Who owns our client data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`Do you sell, let, or both?`,
      shapes: msg`Lettings adds tenancy and maintenance objects.`,
    },
    {
      question: msg`Where do enquiries arrive today?`,
      shapes: msg`Each channel becomes a webhook or a sync.`,
    },
    {
      question: msg`How do you decide between two offers?`,
      shapes: msg`Their answer is the offer comparison screen.`,
    },
    {
      question: msg`Who may see an agent's buyers?`,
      shapes: msg`Sets the roles and row-level rules.`,
    },
    {
      question: msg`What slips through the cracks most?`,
      shapes: msg`Usually the first workflow to build.`,
    },
  ],
};
