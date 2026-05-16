import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

export const NEW_TASK_ROWS = [
  {
    id: 'task-follow-up-anthropic',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Follow up on Enterprise Expansion',
        shortLabel: 'F',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Dario Amodei',
        tone: 'gray' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
      },
      dueDate: { type: 'text' as const, value: 'Nov 1, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Anthropic',
        domain: 'anthropic.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-slack',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Schedule renewal call',
        shortLabel: 'S',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Stewart Butterfield',
        tone: 'teal' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.stewartButterfield,
      },
      dueDate: { type: 'text' as const, value: 'Nov 2, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Slack',
        domain: 'slack.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-figma',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Send proposal to Dylan',
        shortLabel: 'S',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Dylan Field',
        tone: 'purple' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
      },
      dueDate: { type: 'text' as const, value: 'Nov 3, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Figma',
        domain: 'figma.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-notion',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Review consolidation timeline',
        shortLabel: 'R',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Ivan Zhao',
        tone: 'gray' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.ivanZhao,
      },
      dueDate: { type: 'text' as const, value: 'Nov 4, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Notion',
        domain: 'notion.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-github',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Check in on Copilot Rollout',
        shortLabel: 'C',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Thomas Dohmke',
        tone: 'gray' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.thomasDohmke,
      },
      dueDate: { type: 'text' as const, value: 'Nov 5, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Github',
        domain: 'github.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-airbnb',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Review Host Ops proposal',
        shortLabel: 'R',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Brian Chesky',
        tone: 'pink' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.brianChesky,
      },
      dueDate: { type: 'text' as const, value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Airbnb',
        domain: 'airbnb.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-stripe',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Send billing expansion contract',
        shortLabel: 'S',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Patrick Collison',
        tone: 'blue' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
      },
      dueDate: { type: 'text' as const, value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Stripe',
        domain: 'stripe.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-sequoia',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Schedule quarterly review',
        shortLabel: 'S',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Roelof Botha',
        tone: 'green' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.roelofBotha,
      },
      dueDate: { type: 'text' as const, value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Sequoia',
        domain: 'sequoia.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-accel',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Follow up on Portfolio Sync',
        shortLabel: 'F',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Ping Li',
        tone: 'purple' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.pingLi,
      },
      dueDate: { type: 'text' as const, value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Accel',
        domain: 'accel.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-google',
    cells: {
      title: {
        type: 'text' as const,
        value: 'Prep AI Solutions deck',
        shortLabel: 'P',
        tone: 'teal' as const,
      },
      assignee: {
        type: 'person' as const,
        name: 'Sundar Pichai',
        tone: 'teal' as const,
        kind: 'person' as const,
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.sundarPichai,
      },
      dueDate: { type: 'text' as const, value: 'Nov 8, 2023' },
      relatedTo: {
        type: 'entity' as const,
        name: 'Google',
        domain: 'google.com',
      },
      status: { type: 'tag' as const, value: 'To Do' },
    },
  },
];

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
