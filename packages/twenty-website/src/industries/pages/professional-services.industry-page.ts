import { msg } from '@lingui/core/macro';
import { IconBriefcase } from '@tabler/icons-react';

import { type RowDef } from '@/app-preview/types';

import { type IndustryCategoryPage } from '../industry-page-types';

const engagementRow = (
  id: string,
  name: string,
  client: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  endsOn: string,
  lead: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'blue' },
    client: { type: 'entity', name: client },
    stage: { type: 'select', ...stage },
    endsOn: { type: 'text', value: endsOn },
    lead: { type: 'person', name: lead, kind: 'person', tone: 'gray' },
  },
});

export const PROFESSIONAL_SERVICES_INDUSTRY_PAGE: IndustryCategoryPage = {
  kind: 'category',
  slug: 'professional-services',
  status: 'draft',
  name: msg`Professional services`,
  menu: {
    description: msg`From proposal to staffed project`,
    icon: IconBriefcase,
  },
  meta: {
    title: msg`Twenty for professional services — from proposal to staffed engagement`,
    description: msg`Model proposals, engagements, consultants and staffing in an open source CRM. See an example firm workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Win the proposal. *The engagement sets itself up*`,
    body: msg`One record from proposal to staffed engagement, connected to the people who deliver it. Here is an example firm workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ashgrove Advisory',
    tableObjectId: 'engagement',
    viewName: 'Active engagements',
    columns: [
      { id: 'name', label: 'Engagement', width: 200, isFirstColumn: true },
      { id: 'client', label: 'Client', width: 160 },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'endsOn', label: 'Ends on', width: 130 },
      { id: 'lead', label: 'Engagement lead', width: 160 },
    ],
    rows: [
      engagementRow(
        'pricing-review',
        'Pricing review',
        'Brightwater Foods',
        { value: 'Delivering', color: 'green' },
        'Jan 30, 2027',
        'Nadia Clarke',
      ),
      engagementRow(
        'erp-selection',
        'ERP selection',
        'Kestrel Logistics',
        { value: 'Staffing', color: 'amber' },
        'Apr 16, 2027',
        'Daniel Moreau',
      ),
      engagementRow(
        'audit-readiness',
        'Audit readiness',
        'Halden Clinics',
        { value: 'Delivering', color: 'green' },
        'In 24 days',
        'Sofia Lindqvist',
      ),
      engagementRow(
        'growth-strategy',
        'Growth strategy',
        'Marlow Outdoor',
        { value: 'Kick-off', color: 'blue' },
        'Mar 5, 2027',
        'Nadia Clarke',
      ),
      engagementRow(
        'carve-out',
        'Carve-out support',
        'Fenwick Industrial',
        { value: 'Closed', color: 'gray' },
        'Closed',
        'Daniel Moreau',
      ),
    ],
    record: {
      name: 'ERP selection',
      createdAt: 'Added Nov 12',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Staffing' },
        },
        {
          label: 'Client',
          value: { type: 'text', value: 'Kestrel Logistics' },
        },
        { label: 'Fee', value: { type: 'currency', value: '$184,000' } },
        { label: 'Ends on', value: { type: 'text', value: 'Apr 16, 2027' } },
        {
          label: 'Engagement lead',
          value: { type: 'person', name: 'Daniel Moreau', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`A won deal means re-keying it into four tools.`,
      answer: msg`One workflow turns the won proposal into an engagement and calls each tool over HTTP.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We can't see who is free to staff the work.`,
      answer: msg`A capacity board on each engagement shows consultants by week and allocation.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`Partners keep their relationships in their inbox.`,
      answer: msg`Email and calendar sync puts client threads and meetings on the client timeline.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`We moved from Salesforce once and it hurt.`,
      answer: msg`Accounts, opportunities and projects map to clients, proposals and engagements.`,
      answeredBy: 'switching',
    },
  ],
  dataModel: {
    heading: msg`Model the firm *the way partners talk about it*`,
    objects: [
      {
        id: 'proposal',
        label: msg`Proposals`,
        purpose: msg`A priced offer to a client, with a scope and a decision date.`,
        fields: [
          { label: msg`Fee` },
          { label: msg`Decision date` },
          { label: msg`Client`, relatesTo: 'company' },
        ],
        previewIcon: 'fileText',
        previewTone: 'purple',
      },
      {
        id: 'engagement',
        label: msg`Engagements`,
        purpose: msg`The work a won proposal becomes, with a start, an end and a team.`,
        fields: [
          { label: msg`Starts on` },
          { label: msg`Ends on` },
          { label: msg`Client`, relatesTo: 'company' },
          { label: msg`Proposal`, relatesTo: 'proposal' },
        ],
        previewIcon: 'briefcase',
        previewTone: 'blue',
      },
      {
        id: 'consultant',
        label: msg`Consultants`,
        purpose: msg`The people who deliver, with their grade and skills.`,
        fields: [
          { label: msg`Grade` },
          { label: msg`Skills` },
          { label: msg`Rate card`, relatesTo: 'rateCard' },
        ],
        previewIcon: 'user',
        previewTone: 'teal',
      },
      {
        id: 'assignment',
        label: msg`Assignments`,
        purpose: msg`One consultant on one engagement, with a role and an allocation.`,
        fields: [
          { label: msg`Role` },
          { label: msg`Allocation` },
          { label: msg`Consultant`, relatesTo: 'consultant' },
          { label: msg`Engagement`, relatesTo: 'engagement' },
        ],
        previewIcon: 'users',
        previewTone: 'green',
      },
      {
        id: 'rateCard',
        label: msg`Rate cards`,
        purpose: msg`Day rates and cost by grade, the basis of every margin.`,
        fields: [
          { label: msg`Grade` },
          { label: msg`Day rate` },
          { label: msg`Cost rate` },
        ],
        previewIcon: 'coins',
        previewTone: 'amber',
      },
    ],
    notes: [
      {
        title: msg`A proposal becomes an engagement`,
        body: msg`The engagement links back to the proposal, so scope and fee follow the work.`,
      },
      {
        title: msg`Staffing is a record`,
        body: msg`Assignments carry role and allocation, so capacity is a view, not a spreadsheet.`,
      },
      {
        title: msg`Relationships stay on the client`,
        body: msg`Synced emails and meetings land on the client and its people, not in one partner's inbox.`,
      },
    ],
  },
  workflows: {
    heading: msg`The setup runs itself. *Partners keep the judgment*`,
    items: [
      {
        title: msg`Proposal won`,
        outcome: msg`A signed proposal is a staffed engagement the same day.`,
        steps: [
          { kind: 'trigger', label: msg`Proposal stage is set to Won` },
          { kind: 'action', label: msg`Create the engagement` },
          { kind: 'action', label: msg`Open a billing code over HTTP` },
          { kind: 'action', label: msg`Reserve the proposed team` },
          { kind: 'action', label: msg`Post to the team channel over HTTP` },
        ],
      },
      {
        title: msg`Lead qualified`,
        outcome: msg`The partner hears about a qualified lead where they already work.`,
        steps: [
          {
            kind: 'trigger',
            label: msg`Client status is set to Qualified lead`,
          },
          {
            kind: 'action',
            label: msg`Notify the partner in Microsoft Teams over HTTP`,
          },
        ],
      },
      {
        title: msg`Engagement ending`,
        outcome: msg`Every extension conversation starts a month before the end date.`,
        steps: [
          { kind: 'trigger', label: msg`Every day at 08:00` },
          { kind: 'action', label: msg`Find engagements ending in 30 days` },
          {
            kind: 'action',
            label: msg`Ask the engagement lead about an extension`,
          },
        ],
      },
    ],
  },
  agents: {
    heading: msg`Agents that draft the work. *Partners sign it*`,
    items: [
      {
        name: msg`Proposal writer`,
        job: msg`Drafts a first proposal from the client's history and similar past engagements.`,
        reads: ['company', 'proposal', 'engagement', 'note'],
        writes: ['note'],
        limit: msg`Drafts only. A partner reviews and sends.`,
      },
      {
        name: msg`Staffing scout`,
        job: msg`Suggests a team for a won proposal from skills and free capacity.`,
        reads: ['engagement', 'consultant', 'assignment'],
        writes: ['task'],
        limit: msg`Cannot read rate cards or create assignments.`,
      },
    ],
  },
  customScreen: {
    title: msg`Capacity board`,
    placedOn: 'engagement',
    description: msg`Shows each consultant's allocation by week, so the lead staffs from free capacity.`,
    preview: {
      tabLabel: 'Capacity',
      title: 'Capacity board',
      caption: 'Allocation across all engagements',
      columns: ['Consultant', 'Week 1', 'Week 2', 'Week 3'],
      rows: [
        {
          id: 'ines',
          highlighted: true,
          cells: [
            { type: 'person', name: 'Ines Ferreira', kind: 'person' },
            { type: 'select', color: 'green', value: '40%' },
            { type: 'select', color: 'green', value: '40%' },
            { type: 'select', color: 'green', value: '20%' },
          ],
        },
        {
          id: 'marcus',
          cells: [
            { type: 'person', name: 'Marcus Webb', kind: 'person' },
            { type: 'select', color: 'amber', value: '80%' },
            { type: 'select', color: 'amber', value: '80%' },
            { type: 'select', color: 'green', value: '50%' },
          ],
        },
        {
          id: 'hana',
          cells: [
            { type: 'person', name: 'Hana Kobayashi', kind: 'person' },
            { type: 'select', color: 'red', value: '100%' },
            { type: 'select', color: 'red', value: '100%' },
            { type: 'select', color: 'amber', value: '90%' },
          ],
        },
      ],
      footnote: 'Ines can take the ERP selection from week 1.',
    },
  },
  access: {
    heading: msg`Consultants see their work. *Partners see the margins*`,
    roles: [
      { id: 'consultant', label: msg`Consultant` },
      { id: 'partner', label: msg`Partner` },
      { id: 'finance', label: msg`Finance` },
    ],
    rules: [
      {
        objectId: 'engagement',
        accessByRoleId: {
          consultant: msg`Staffed on only, no fees`,
          partner: msg`See and edit all`,
          finance: msg`See all`,
        },
      },
      {
        objectId: 'proposal',
        accessByRoleId: {
          consultant: msg`No access`,
          partner: msg`See and edit all`,
          finance: msg`See all`,
        },
      },
      {
        objectId: 'rateCard',
        accessByRoleId: {
          consultant: msg`No access`,
          partner: msg`See and edit all`,
          finance: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Opportunity', objectId: 'proposal' },
      { salesforceObject: 'Project (custom)', objectId: 'engagement' },
    ],
    note: msg`Export with the Salesforce data loader, then import by CSV or through the API.`,
  },
  proof: { kind: 'caseStudy', caseStudySlug: 'elevate-consulting' },
  questions: [
    {
      question: msg`We need time tracking and invoicing.`,
      answer: msg`Keep your billing tool. Twenty holds client and engagement data and calls it over the API when work is won.`,
    },
    {
      question: msg`Our partners won't use a CRM.`,
      answer: msg`Email and calendar sync fill each client's timeline, so partners find their relationships already there when they log in.`,
    },
    {
      question: msg`Can rates stay private?`,
      answer: msg`Yes. Roles set object and field permissions, so consultants never see rate cards or fees.`,
    },
    {
      question: msg`Who owns our client data?`,
      answer: msg`You do. Twenty is open source: use our cloud or host it yourself, and export whenever you want.`,
    },
  ],
  discovery: [
    {
      question: msg`What happens between a signed proposal and day one?`,
      shapes: msg`Each step becomes an action in the proposal won workflow.`,
    },
    {
      question: msg`Which tools hold billing, staffing and projects?`,
      shapes: msg`Each tool becomes an HTTP request or an API sync.`,
    },
    {
      question: msg`Who owns a client relationship?`,
      shapes: msg`Sets the roles and which mailboxes sync.`,
    },
    {
      question: msg`How do you price?`,
      shapes: msg`Day rates, fixed fees or retainers shape the proposal and rate card fields.`,
    },
    {
      question: msg`Who would maintain the CRM?`,
      shapes: msg`Decides between no-code changes and building on the API.`,
    },
  ],
};
