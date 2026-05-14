import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

export const NEW_COMPANY_ROW = {
  id: 'openai',
  cells: {
    company: { type: 'entity' as const, name: 'OpenAI', domain: 'openai.com' },
    url: { type: 'link' as const, value: 'openai.com' },
    createdBy: {
      type: 'person' as const,
      name: 'AI Agent',
      tone: 'gray' as const,
      kind: 'system' as const,
      shortLabel: 'AI',
    },
    address: { type: 'text' as const, value: '3180 18th St' },
    accountOwner: {
      type: 'person' as const,
      name: 'Sam Altman',
      tone: 'amber' as const,
      kind: 'person' as const,
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    icp: { type: 'boolean' as const, value: true },
    arr: { type: 'number' as const, value: '$2,000,000' },
    linkedin: { type: 'link' as const, value: 'openai' },
    industry: { type: 'tag' as const, value: 'AI Research' },
    mainContact: {
      type: 'person' as const,
      name: 'Sam Altman',
      shortLabel: 'S',
      tone: 'amber' as const,
      kind: 'person' as const,
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    employees: { type: 'number' as const, value: '3,500' },
    opportunities: { type: 'relation' as const, items: [] },
    added: { type: 'text' as const, value: 'Just now' },
  },
};

export const NEW_PERSON_ROW = {
  id: 'sam-altman',
  cells: {
    name: {
      type: 'person' as const,
      name: 'Sam Altman',
      tone: 'amber' as const,
      kind: 'person' as const,
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    company: { type: 'entity' as const, name: 'OpenAI', domain: 'openai.com' },
    email: { type: 'link' as const, value: 'sam@openai.com' },
    phone: { type: 'text' as const, value: '+1 415 555 0199' },
    jobTitle: { type: 'text' as const, value: 'CEO' },
    city: { type: 'text' as const, value: 'San Francisco' },
    linkedin: { type: 'link' as const, value: 'sama' },
    added: { type: 'text' as const, value: 'Just now' },
  },
};

export const PROMPT_OPTIONS = [
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    label: 'Add a new lead',
    navSteps: [
      { at: 0.25, target: 'Companies' },
      { at: 0.65, target: 'People' },
    ],
    response:
      'Adding OpenAI as a new company. Setting domain to openai.com, industry to AI Research, and ARR to $2,000,000. Account owner assigned to Sam Altman. Company record is live in your CRM.\n\nNow creating the contact — adding Sam Altman as CEO at OpenAI, based in San Francisco. Person record linked to the company.',
  },
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    label: 'Create a dashboard',
    navSteps: [
      { at: 0.35, target: 'Dashboards' },
      { at: 0.75, target: 'Sales Dashboard' },
    ],
    response:
      "Building a Sales Performance dashboard. I'll include revenue by month, new subscriptions, churn rate, and a distribution chart. Navigating to dashboards now... Opening the Sales Dashboard — your metrics are ready.",
  },
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15 1.65 1.65 0 003 14.08V14a2 2 0 014 0v.09" />
      </svg>
    ),
    label: 'Set up a workflow',
    navSteps: [{ at: 0.45, target: 'Create company when adding a new person' }],
    response:
      'Creating an automation: when a new person is added, automatically create their company record and link them. Setting the trigger and actions now... Workflow is active and ready to run.',
  },
];
