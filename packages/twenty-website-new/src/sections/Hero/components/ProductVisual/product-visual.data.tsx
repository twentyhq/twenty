import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';
import type {
  RecordPageDefinition,
  RowDef,
} from '@/sections/AppPreview/types/app-preview-data';

export const NEW_TASK_ROWS: RowDef[] = [
  {
    id: 'task-follow-up-anthropic',
    cells: {
      title: {
        type: 'text',
        value: 'Follow up on Enterprise Expansion',
        shortLabel: 'F',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Dario Amodei',
        tone: 'gray',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
      },
      dueDate: { type: 'text', value: 'Nov 1, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Anthropic',
        domain: 'anthropic.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-slack',
    cells: {
      title: {
        type: 'text',
        value: 'Schedule renewal call',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Stewart Butterfield',
        tone: 'teal',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.stewartButterfield,
      },
      dueDate: { type: 'text', value: 'Nov 2, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Slack',
        domain: 'slack.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-figma',
    cells: {
      title: {
        type: 'text',
        value: 'Send proposal to Dylan',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Dylan Field',
        tone: 'purple',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
      },
      dueDate: { type: 'text', value: 'Nov 3, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Figma',
        domain: 'figma.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-notion',
    cells: {
      title: {
        type: 'text',
        value: 'Review consolidation timeline',
        shortLabel: 'R',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Ivan Zhao',
        tone: 'gray',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.ivanZhao,
      },
      dueDate: { type: 'text', value: 'Nov 4, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Notion',
        domain: 'notion.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-github',
    cells: {
      title: {
        type: 'text',
        value: 'Check in on Copilot Rollout',
        shortLabel: 'C',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Thomas Dohmke',
        tone: 'gray',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.thomasDohmke,
      },
      dueDate: { type: 'text', value: 'Nov 5, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Github',
        domain: 'github.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-airbnb',
    cells: {
      title: {
        type: 'text',
        value: 'Review Host Ops proposal',
        shortLabel: 'R',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Brian Chesky',
        tone: 'pink',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.brianChesky,
      },
      dueDate: { type: 'text', value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Airbnb',
        domain: 'airbnb.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-stripe',
    cells: {
      title: {
        type: 'text',
        value: 'Send billing expansion contract',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Patrick Collison',
        tone: 'blue',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
      },
      dueDate: { type: 'text', value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Stripe',
        domain: 'stripe.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-sequoia',
    cells: {
      title: {
        type: 'text',
        value: 'Schedule quarterly review',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Roelof Botha',
        tone: 'green',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.roelofBotha,
      },
      dueDate: { type: 'text', value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Sequoia',
        domain: 'sequoia.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-accel',
    cells: {
      title: {
        type: 'text',
        value: 'Follow up on Portfolio Sync',
        shortLabel: 'F',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Ping Li',
        tone: 'purple',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.pingLi,
      },
      dueDate: { type: 'text', value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Accel',
        domain: 'accel.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-google',
    cells: {
      title: {
        type: 'text',
        value: 'Prep AI Solutions deck',
        shortLabel: 'P',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Sundar Pichai',
        tone: 'teal',
        kind: 'person',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.sundarPichai,
      },
      dueDate: { type: 'text', value: 'Nov 8, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Google',
        domain: 'google.com',
      },
      status: { type: 'tag', value: 'To Do' },
    },
  },
];

export const NEW_COMPANY_ROW: RowDef = {
  id: 'openai',
  cells: {
    company: { type: 'entity', name: 'OpenAI', domain: 'openai.com' },
    url: { type: 'link', value: 'openai.com' },
    createdBy: {
      type: 'person',
      name: 'AI Agent',
      tone: 'gray',
      kind: 'system',
      shortLabel: 'AI',
    },
    address: { type: 'text', value: '3180 18th St' },
    accountOwner: {
      type: 'person',
      name: 'Sam Altman',
      tone: 'amber',
      kind: 'person',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    icp: { type: 'boolean', value: true },
    arr: { type: 'number', value: '$2,000,000' },
    linkedin: { type: 'link', value: 'openai' },
    industry: { type: 'tag', value: 'AI Research' },
    mainContact: {
      type: 'person',
      name: 'Sam Altman',
      shortLabel: 'S',
      tone: 'amber',
      kind: 'person',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    employees: { type: 'number', value: '3,500' },
    opportunities: { type: 'relation', items: [] },
    added: { type: 'text', value: 'Just now' },
  },
};

export const NEW_PERSON_ROW: RowDef = {
  id: 'sam-altman',
  cells: {
    name: {
      type: 'person',
      name: 'Sam Altman',
      tone: 'amber',
      kind: 'person',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
    },
    company: { type: 'entity', name: 'OpenAI', domain: 'openai.com' },
    email: { type: 'link', value: 'sam@openai.com' },
    phone: { type: 'text', value: '+1 415 555 0199' },
    jobTitle: { type: 'text', value: 'CEO' },
    city: { type: 'text', value: 'San Francisco' },
    linkedin: { type: 'link', value: 'sama' },
    added: { type: 'text', value: 'Just now' },
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
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    label: 'Show me all deals closing this month',
    navSteps: [{ at: 0.3, target: 'Opportunities' }],
    response:
      'Filtering your pipeline to deals closing this month. Found 7 opportunities worth $12.9M total across Identified, Qualified, and Engaged stages. The biggest: Host Ops with Airbnb at $4,200,000, followed by AI Prototyping with Figma at $3,500,000.',
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
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    label: 'Create follow-up tasks for my top 10 accounts',
    navSteps: [{ at: 0.3, target: 'Tasks' }],
    response:
      'Creating follow-up tasks for your top 10 accounts by ARR. Done — added 10 tasks:\n\n• "Follow up on Enterprise Expansion" → Anthropic (Nov 1)\n• "Schedule renewal call" → Slack (Nov 2)\n• "Send proposal to Dylan" → Figma (Nov 3)\n• "Review consolidation timeline" → Notion (Nov 4)\n• "Check in on Copilot Rollout" → Github (Nov 5)\n• "Review Host Ops proposal" → Airbnb (Nov 6)\n• "Send billing expansion contract" → Stripe (Nov 6)\n• "Schedule quarterly review" → Sequoia (Nov 7)\n• "Follow up on Portfolio Sync" → Accel (Nov 7)\n• "Prep AI Solutions deck" → Google (Nov 8)\n\nAll assigned to account owners with 7-day deadlines.',
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
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: "Summarize this customer's history",
    navSteps: [{ at: 0.3, target: 'Companies' }],
    response:
      "Here's the history for Qonto:\n\nLogged a call between Phil Schiller and Steve Anavi — focused on selling through benefits rather than features. Strategy: emphasize how our CRM streamlines operations and improves customer service.\n\nFollow-up with Alexandre Prot to understand their pain points and position our tool as the solution.\n\n3 notes total, 12 people associated, with Q Global Holdings as parent company. Active opportunity in pipeline.",
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
    label: 'Create a workflow that sends an email sequence',
    navSteps: [{ at: 0.4, target: 'Send email sequence when deal is engaged' }],
    response:
      "I built and activated a workflow that sends an email sequence to each one of the selected People.\n\nThis will only send if the Person has emails.primaryEmail filled in. If some People don't have an email, I'll add a filter step to skip sending when the email is empty (to avoid failures).\n\nIf you want to customize the email subject/body (branding, links, etc.), paste your desired text and I'll update the workflow.",
  },
];

export const QONTO_RECORD_PAGE: RecordPageDefinition = {
  type: 'record',
  header: {
    title: 'Qonto',
    count: 12,
  },
  record: {
    logoDomain: 'qonto.com',
    name: 'Qonto',
    createdAt: 'Created 4 hours ago',
    fields: [
      { icon: 'link', label: 'URL', value: 'qonto.com' },
      {
        icon: 'user',
        label: 'Account O...',
        value: 'Phil Schiller',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.philSchiller,
      },
      {
        icon: 'mapPin',
        label: 'Address',
        value: '18 Rue De Navarin, 75009 Paris',
      },
      { icon: 'check', label: 'ICP', value: '✓ True' },
      { icon: 'currency', label: 'Revenue', value: '$500,000' },
      {
        icon: 'linkedin',
        label: 'Linkedin',
        value: 'linkedin.com/company/q...',
      },
      { icon: 'twitter', label: 'Twitter', value: '@qonto' },
    ],
    moreCount: 12,
    relations: [
      {
        title: 'Holdings',
        items: [{ name: 'Q Global Holdings', domain: 'qonto.com' }],
      },
      {
        title: 'Opportunities',
        items: [{ name: 'Qonto', domain: 'qonto.com' }],
      },
      {
        title: 'People',
        count: 12,
        items: [
          {
            name: 'Alexandre',
            avatarUrl: SHARED_PEOPLE_AVATAR_URLS.alexandreProt,
          },
          {
            name: 'Steve Anavi',
            avatarUrl: SHARED_PEOPLE_AVATAR_URLS.steveAnavi,
          },
        ],
      },
    ],
  },
  notes: [
    {
      id: 'logged-call',
      title: 'Logged call (Phil Schiller ↔ Steve Anavi)',
      body: 'Apple sells its products by focusing on the benefits users gain from their products, rather than solely highlighting the features. The same approach should be used for selling to Qonto. Understand their pain points and how your product can alleviate those issues. Emphasize how our CRM tool can help streamline their operations, improve customer service, and ultimately, grow their business.',
      relation: {
        name: 'Alexandre',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.alexandreProt,
      },
    },
    {
      id: 'follow-up',
      title: 'Follow-up with Alexandre',
      body: 'Understand their pain points and how your product can alleviate those issues. Emphasize how our CRM tool can help streamline their operations, improve customer service, and ultimately, grow their business.',
    },
    {
      id: 'third-note',
      title: 'Third note',
      body: 'Apple sells its products by focusing on the benefits users gain from their products, rather than solely highlighting the features. The same approach should be used for selling to Qonto. Understand their pain points and how your product can alleviate those issues. Emphasize how our CRM tool can help streamline their operations, improve customer service, and ultimately, grow their business.',
    },
  ],
};
