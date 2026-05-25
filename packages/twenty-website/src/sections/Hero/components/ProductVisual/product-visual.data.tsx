import {
  SHARED_COMPANY_LOGO_URLS,
  SHARED_PEOPLE_AVATAR_URLS,
} from '@/content/site/asset-paths';
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
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
      status: { type: 'select', value: 'To Do' },
    },
  },
];

export const NEW_COMPANY_ROW: RowDef = {
  id: 'openai',
  cells: {
    company: { type: 'entity', name: 'OpenAI', domain: 'openai.com' },
    url: { type: 'link', kind: 'url', value: 'openai.com' },
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
    arr: { type: 'currency', value: '$2,000,000' },
    linkedin: { type: 'link', kind: 'social', value: 'openai' },
    industry: { type: 'select', value: 'AI Research' },
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
    email: { type: 'link', kind: 'email', value: 'sam@openai.com' },
    phone: { type: 'link', kind: 'phone', value: '+1 415 555 0199' },
    jobTitle: { type: 'text', value: 'CEO' },
    city: { type: 'text', value: 'San Francisco' },
    linkedin: { type: 'link', kind: 'social', value: 'sama' },
    added: { type: 'text', value: 'Just now' },
  },
};

export type ResponseChip = {
  logoUrl: string;
  name: string;
};

export const COMPANIES_PAGE_ITEM_ID = 'companies';
export const PEOPLE_PAGE_ITEM_ID = 'people';
export const OPPORTUNITIES_PAGE_ITEM_ID = 'opportunities';
export const TASKS_PAGE_ITEM_ID = 'tasks';
export const WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID =
  'workflow-send-email-sequence';

export const PROMPT_OPTIONS = [
  {
    label: 'Add a new lead',
    navSteps: [
      { at: 0.25, targetPageItemId: COMPANIES_PAGE_ITEM_ID },
      { at: 0.65, targetPageItemId: PEOPLE_PAGE_ITEM_ID },
    ],
    responseText:
      'OpenAI is now in Companies with openai.com, AI Research, and $2.0M ARR. Sam Altman was added in People as CEO in San Francisco and linked back to OpenAI as the main contact.',
    responseChips: [
      { name: 'OpenAI', logoUrl: SHARED_COMPANY_LOGO_URLS.openai },
    ],
  },
  {
    label: 'Show me all deals closing this month',
    navSteps: [{ at: 0.3, targetPageItemId: OPPORTUNITIES_PAGE_ITEM_ID }],
    responseText:
      'There are 7 opportunities on the board worth $12.9M total. Biggest: Host Ops with Airbnb at $4.2M, then AI Prototyping with Figma at $3.5M. The rest are spread across Stripe, Github, Notion, Anthropic, and Mailchimp.',
    responseChips: [
      { name: 'Airbnb', logoUrl: SHARED_COMPANY_LOGO_URLS.airbnb },
      { name: 'Figma', logoUrl: SHARED_COMPANY_LOGO_URLS.figma },
      { name: 'Stripe', logoUrl: SHARED_COMPANY_LOGO_URLS.stripe },
      { name: 'Github', logoUrl: SHARED_COMPANY_LOGO_URLS.github },
      { name: 'Notion', logoUrl: SHARED_COMPANY_LOGO_URLS.notion },
      { name: 'Anthropic', logoUrl: SHARED_COMPANY_LOGO_URLS.anthropic },
      { name: 'Mailchimp', logoUrl: SHARED_COMPANY_LOGO_URLS.mailchimp },
    ],
  },
  {
    label: 'Create follow-up tasks for my top 10 accounts',
    navSteps: [{ at: 0.3, targetPageItemId: TASKS_PAGE_ITEM_ID }],
    responseText:
      'Created 10 follow-up tasks scheduled from Nov 1 to Nov 8. The first batch covers Anthropic, Slack, Figma, Notion, and Github, with the rest covering Airbnb, Stripe, Sequoia, Accel, and Google.',
    responseChips: [
      { name: 'Anthropic', logoUrl: SHARED_COMPANY_LOGO_URLS.anthropic },
      { name: 'Slack', logoUrl: SHARED_COMPANY_LOGO_URLS.slack },
      { name: 'Figma', logoUrl: SHARED_COMPANY_LOGO_URLS.figma },
      { name: 'Notion', logoUrl: SHARED_COMPANY_LOGO_URLS.notion },
      { name: 'Github', logoUrl: SHARED_COMPANY_LOGO_URLS.github },
      { name: 'Airbnb', logoUrl: SHARED_COMPANY_LOGO_URLS.airbnb },
      { name: 'Stripe', logoUrl: SHARED_COMPANY_LOGO_URLS.stripe },
      { name: 'Sequoia', logoUrl: SHARED_COMPANY_LOGO_URLS.sequoia },
      { name: 'Accel', logoUrl: SHARED_COMPANY_LOGO_URLS.accel },
      { name: 'Google', logoUrl: SHARED_COMPANY_LOGO_URLS.google },
    ],
  },
  {
    label: "Summarize this customer's history",
    navSteps: [{ at: 0.3, targetPageItemId: COMPANIES_PAGE_ITEM_ID }],
    responseText:
      'Qonto has 3 notes, 12 linked people, Q Global Holdings as the parent account, and 1 active opportunity. Recent calls with Phil Schiller and Steve Anavi focused on selling through benefits, and the next follow-up is with Alexandre Prot.',
    responseChips: [
      { name: 'Qonto', logoUrl: SHARED_COMPANY_LOGO_URLS.qonto },
    ],
  },
  {
    label: 'Create a workflow that sends an email sequence',
    navSteps: [
      { at: 0.4, targetPageItemId: WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID },
    ],
    responseText:
      'Created and activated "Send email sequence when deal is engaged" with a Manual trigger, an Iterator, and a Send Email step. It is ready to run as-is, and I can add filters or customize the email copy next.',
    responseChips: [],
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
      {
        icon: 'link',
        label: 'URL',
        value: { type: 'link', kind: 'url', value: 'qonto.com' },
      },
      {
        icon: 'user',
        label: 'Account Owner',
        value: {
          type: 'person',
          name: 'Phil Schiller',
          avatarUrl: SHARED_PEOPLE_AVATAR_URLS.philSchiller,
          kind: 'person',
          tone: 'gray',
        },
      },
      {
        icon: 'mapPin',
        label: 'Address',
        value: { type: 'text', value: '18 Rue De Navarin, 75009 Paris' },
      },
      {
        icon: 'check',
        label: 'ICP',
        value: { type: 'boolean', value: true },
      },
      {
        icon: 'currency',
        label: 'Revenue',
        value: { type: 'currency', value: '$500,000' },
      },
      {
        icon: 'linkedin',
        label: 'LinkedIn',
        value: {
          type: 'link',
          kind: 'social',
          label: 'linkedin.com/company/q...',
          value: 'qonto',
        },
      },
      {
        icon: 'twitter',
        label: 'Twitter',
        value: {
          type: 'link',
          kind: 'social',
          value: '@qonto',
        },
      },
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
