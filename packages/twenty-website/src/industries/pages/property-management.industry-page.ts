import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const requestRow = (
  id: string,
  request: string,
  unit: string,
  priority: { value: string; color: 'red' | 'amber' | 'blue' | 'gray' },
  contractor: string,
  reported: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: request, shortLabel: request[0], tone: 'red' },
    unit: { type: 'text', value: unit },
    priority: { type: 'select', ...priority },
    contractor: { type: 'entity', name: contractor },
    reported: { type: 'text', value: reported },
  },
});

export const PROPERTY_MANAGEMENT_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'property-management',
  parentSlug: 'real-estate',
  status: 'draft',
  name: msg`Property management`,
  meta: {
    title: msg`Twenty for property management — buildings, leases and repairs`,
    description: msg`Track buildings, units, leases and maintenance requests in an open source CRM. See an example property management workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Leases, units and repairs *on one record*`,
    body: msg`Every unit knows its tenant, its lease dates and its open repairs. Here is an example property management workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Bramblegate Living',
    tableObjectId: 'maintenanceRequest',
    viewName: 'Open requests',
    columns: [
      { id: 'name', label: 'Request', width: 190, isFirstColumn: true },
      { id: 'unit', label: 'Unit', width: 150 },
      { id: 'priority', label: 'Priority', width: 120 },
      { id: 'contractor', label: 'Contractor', width: 170 },
      { id: 'reported', label: 'Reported', width: 120 },
    ],
    rows: [
      requestRow(
        'boiler',
        'No hot water',
        'Linden Court 4B',
        { value: 'Urgent', color: 'red' },
        'Corrigan Heating',
        'Today',
      ),
      requestRow(
        'window',
        'Cracked bedroom window',
        'Linden Court 2A',
        { value: 'High', color: 'amber' },
        'Clearview Glazing',
        'Yesterday',
      ),
      requestRow(
        'tap',
        'Dripping kitchen tap',
        'Ashby House 7',
        { value: 'Normal', color: 'blue' },
        'Pell & Sons Plumbing',
        'Nov 21',
      ),
      requestRow(
        'intercom',
        'Intercom not ringing',
        'Linden Court 6C',
        { value: 'Normal', color: 'blue' },
        'Voltline Electrical',
        'Nov 20',
      ),
      requestRow(
        'paint',
        'Hallway scuffs',
        'Ashby House 3',
        { value: 'Low', color: 'gray' },
        'Pell & Sons Plumbing',
        'Nov 14',
      ),
    ],
    record: {
      name: 'Linden Court',
      createdAt: 'Added Jan 12',
      fields: [
        { label: 'Units', value: { type: 'text', value: '24' } },
        { label: 'Occupancy', value: { type: 'text', value: '22 of 24' } },
        { label: 'Open requests', value: { type: 'text', value: '3' } },
        {
          label: 'Property manager',
          value: { type: 'person', name: 'Ruth Adebayo', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Tenants, units and leases live in three spreadsheets.`,
      answer: msg`Building, unit and lease are linked objects, so one record shows all three.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Repair requests sit in a shared inbox.`,
      answer: msg`A form or webhook files each request on its unit, triaged before anyone opens it.`,
      answeredBy: 'agents',
    },
    {
      complaint: msg`We learn a lease ended when the rent stops.`,
      answer: msg`A daily workflow flags every lease 90 days before it ends.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Nobody can say which units are empty.`,
      answer: msg`Each building shows its units, tenants and lease end dates on one tab.`,
      answeredBy: 'customScreen',
    },
  ],
  addedObjects: [
    {
      id: 'building',
      label: msg`Buildings`,
      purpose: msg`The block you manage, with its owner and its manager.`,
      fields: [
        { label: msg`Address` },
        { label: msg`Owner`, relatesTo: 'company' },
        { label: msg`Property manager`, relatesTo: 'person' },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'blue',
    },
    {
      id: 'unit',
      label: msg`Units`,
      purpose: msg`One lettable flat or office inside a building.`,
      fields: [
        { label: msg`Bedrooms` },
        { label: msg`Occupancy` },
        { label: msg`Building`, relatesTo: 'building' },
      ],
      previewIcon: 'key',
      previewTone: 'teal',
    },
    {
      id: 'lease',
      label: msg`Leases`,
      purpose: msg`A tenant in a unit, with rent, review date and end date.`,
      fields: [
        { label: msg`Monthly rent` },
        { label: msg`Rent review on` },
        { label: msg`Ends on` },
        { label: msg`Unit`, relatesTo: 'unit' },
        { label: msg`Tenant`, relatesTo: 'person' },
      ],
      previewIcon: 'fileText',
      previewTone: 'gray',
    },
    {
      id: 'maintenanceRequest',
      label: msg`Maintenance requests`,
      purpose: msg`A repair reported on a unit, from first message to sign-off.`,
      fields: [
        { label: msg`Priority` },
        { label: msg`Contractor`, relatesTo: 'company' },
        { label: msg`Unit`, relatesTo: 'unit' },
      ],
      previewIcon: 'checkbox',
      previewTone: 'red',
    },
  ],
  workflows: [
    {
      title: msg`Lease renewal, 90 days out`,
      outcome: msg`Every tenant gets a renewal conversation before notice is due.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 08:00` },
        { kind: 'action', label: msg`Find leases ending within 90 days` },
        {
          kind: 'agent',
          label: msg`Draft a renewal offer from the rent history`,
        },
        { kind: 'action', label: msg`Create a task for the property manager` },
      ],
    },
    {
      title: msg`Repair request received`,
      outcome: msg`A contractor has a clear brief within minutes of the report.`,
      steps: [
        { kind: 'trigger', label: msg`Tenant submits the repair form` },
        {
          kind: 'action',
          label: msg`Create a maintenance request on the unit`,
        },
        {
          kind: 'agent',
          label: msg`Classify urgency and draft the contractor brief`,
        },
        { kind: 'action', label: msg`Create a task for the contractor` },
      ],
    },
    {
      title: msg`Rent review reminder`,
      outcome: msg`No rent review date passes unnoticed.`,
      steps: [
        { kind: 'trigger', label: msg`Every Monday at 08:00` },
        {
          kind: 'action',
          label: msg`Find leases with a review within 60 days`,
        },
        { kind: 'action', label: msg`Email the property manager the list` },
      ],
    },
  ],
  customScreen: {
    title: msg`Unit occupancy`,
    placedOn: 'building',
    description: msg`Lists every unit in a building with its tenant, lease end and status.`,
    preview: {
      tabLabel: 'Occupancy',
      title: 'Unit occupancy',
      caption: '22 of 24 units let',
      columns: ['Unit', 'Tenant', 'Lease ends', 'Status'],
      rows: [
        {
          id: '2a',
          cells: [
            { type: 'text', value: '2A' },
            { type: 'person', name: 'Felix Brandt', kind: 'person' },
            { type: 'text', value: 'Aug 2027' },
            { type: 'select', color: 'green', value: 'Let' },
          ],
        },
        {
          id: '4b',
          highlighted: true,
          cells: [
            { type: 'text', value: '4B' },
            { type: 'person', name: 'Inés Castillo', kind: 'person' },
            { type: 'text', value: 'Feb 2027' },
            { type: 'select', color: 'amber', value: 'Renewal due' },
          ],
        },
        {
          id: '5a',
          cells: [
            { type: 'text', value: '5A' },
            { type: 'text', value: '—' },
            { type: 'text', value: '—' },
            { type: 'select', color: 'gray', value: 'Vacant' },
          ],
        },
        {
          id: '6c',
          cells: [
            { type: 'text', value: '6C' },
            { type: 'person', name: 'Samir Qureshi', kind: 'person' },
            { type: 'text', value: 'Nov 2027' },
            { type: 'select', color: 'green', value: 'Let' },
          ],
        },
      ],
      footnote:
        '4B also has an urgent repair open. Fix it before the renewal call.',
    },
  },
  agents: {
    heading: msg`Agents that sort the requests. *People send the trades*`,
    items: [
      {
        name: msg`Maintenance triage`,
        job: msg`Classifies each new request, drafts the contractor brief and writes the task.`,
        reads: ['maintenanceRequest', 'unit', 'lease'],
        writes: ['maintenanceRequest', 'task'],
        limit: msg`Drafts the brief but cannot send it or approve spend.`,
      },
      {
        name: msg`Renewal writer`,
        job: msg`Drafts a renewal offer from the lease and rent history.`,
        reads: ['lease', 'unit', 'person'],
        writes: ['note'],
        limit: msg`Cannot change the rent on a lease.`,
      },
    ],
  },
  access: {
    heading: msg`Managers run their buildings. *Owners see their own*`,
    roles: [
      { id: 'propertyManager', label: msg`Property manager` },
      { id: 'coordinator', label: msg`Maintenance coordinator` },
      { id: 'director', label: msg`Director` },
    ],
    rules: [
      {
        objectId: 'lease',
        accessByRoleId: {
          propertyManager: msg`Own buildings`,
          coordinator: msg`No access`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'maintenanceRequest',
        accessByRoleId: {
          propertyManager: msg`Own buildings`,
          coordinator: msg`See and edit all`,
          director: msg`See all`,
        },
      },
      {
        objectId: 'unit',
        accessByRoleId: {
          propertyManager: msg`Own buildings`,
          coordinator: msg`See all, rent hidden`,
          director: msg`See and edit all`,
        },
      },
    ],
  },
  questions: [
    {
      question: msg`Our tenants will not log in to anything.`,
      answer: msg`They do not need to. A web form or your tenant portal sends each request to Twenty by webhook.`,
    },
    {
      question: msg`Can building owners see their own figures?`,
      answer: msg`Yes. Give owners a role, and row-level rules limit it to the buildings they own.`,
    },
  ],
};
