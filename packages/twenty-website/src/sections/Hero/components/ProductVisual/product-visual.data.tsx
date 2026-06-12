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

export type ResponseChip = {
  logoUrl: string;
  name: string;
};

export type ProductVisualSceneKind =
  | 'leadCreation'
  | 'opportunityReview'
  | 'taskCreation'
  | 'dashboardCreation'
  | 'workflowCreation';

export type AgentToolIcon =
  | 'search'
  | 'filter'
  | 'notes'
  | 'tasks'
  | 'record'
  | 'workflow'
  | 'mail';

export type AgentStep =
  | { kind: 'thinking'; durationMs: number }
  | {
      kind: 'tool';
      icon: AgentToolIcon;
      running: string;
      done: string;
      durationMs: number;
    };

export type ProductVisualSceneDefinition = {
  initialPageItemId: string;
  kind: ProductVisualSceneKind;
  label: string;
  responseChips: ResponseChip[];
  responseText: string[];
  sidebarMode?: 'collapsed' | 'expanded';
  followUpPageItemId?: string;
  steps?: AgentStep[];
};

export const COMPANIES_PAGE_ITEM_ID = 'companies';
export const PEOPLE_PAGE_ITEM_ID = 'people';
export const OPPORTUNITIES_PAGE_ITEM_ID = 'opportunities';
export const TASKS_PAGE_ITEM_ID = 'tasks';
export const WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID =
  'workflow-send-email-sequence';
export const SALES_DASHBOARD_PAGE_ITEM_ID = 'sales-dashboard';

export const PRODUCT_VISUAL_SCENES: ProductVisualSceneDefinition[] = [
  {
    initialPageItemId: COMPANIES_PAGE_ITEM_ID,
    kind: 'leadCreation',
    label: 'Add a new lead',
    responseText: [],
    responseChips: [],
    sidebarMode: 'expanded',
  },
  {
    initialPageItemId: OPPORTUNITIES_PAGE_ITEM_ID,
    kind: 'opportunityReview',
    label: 'Build a pipeline board grouped by stage',
    responseText: [
      'Organized your open deals into a **pipeline board** grouped by stage — **New**, **Screening**, **Meeting**, **Proposal**, and **Customer**.',
      'Drag a card to move a deal forward, or open one to see the full history.',
    ],
    responseChips: [
      { name: 'Anthropic', logoUrl: SHARED_COMPANY_LOGO_URLS.anthropic },
      { name: 'Notion', logoUrl: SHARED_COMPANY_LOGO_URLS.notion },
      { name: 'Github', logoUrl: SHARED_COMPANY_LOGO_URLS.github },
      { name: 'Airbnb', logoUrl: SHARED_COMPANY_LOGO_URLS.airbnb },
      { name: 'Figma', logoUrl: SHARED_COMPANY_LOGO_URLS.figma },
      { name: 'Stripe', logoUrl: SHARED_COMPANY_LOGO_URLS.stripe },
      { name: 'Mailchimp', logoUrl: SHARED_COMPANY_LOGO_URLS.mailchimp },
    ],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'search',
        running: 'Reading your open deals',
        done: 'Read 24 deals',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'record',
        running: 'Building the pipeline board',
        done: 'Built the board',
        durationMs: 800,
      },
    ],
  },
  {
    initialPageItemId: TASKS_PAGE_ITEM_ID,
    kind: 'taskCreation',
    label:
      'Generate follow-up tasks for my top 10 accounts using notes to gather context',
    responseText: [
      'Created **10 follow-up tasks** dated **Nov 1 through Nov 8**.',
      'The first rows cover Anthropic, Slack, Figma, Notion, and Github, followed by Airbnb, Stripe, Sequoia, Accel, and Google.',
    ],
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
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'notes',
        running: 'Reading notes on your top 10 accounts',
        done: 'Read 10 accounts',
        durationMs: 1100,
      },
      {
        kind: 'tool',
        icon: 'tasks',
        running: 'Creating 10 follow-up tasks',
        done: 'Created 10 tasks',
        durationMs: 900,
      },
    ],
  },
  {
    initialPageItemId: SALES_DASHBOARD_PAGE_ITEM_ID,
    kind: 'dashboardCreation',
    label: 'Build a dashboard of pipeline by stage and ARR',
    responseText: [
      'Built a **Sales dashboard** with live KPIs — **$12.9M pipeline**, **$2.4M won this quarter**, and a **38% win rate** — plus charts for deals by stage and ARR over time.',
      'It refreshes automatically as your data changes.',
    ],
    responseChips: [],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'search',
        running: 'Aggregating pipeline and revenue',
        done: 'Aggregated 24 deals',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'record',
        running: 'Assembling the dashboard',
        done: 'Built the dashboard',
        durationMs: 900,
      },
    ],
  },
  {
    initialPageItemId: WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID,
    kind: 'workflowCreation',
    label: 'Draft a workflow that sends an email sequence',
    responseText: [
      'Created and activated a sequence with a **Manual trigger**, an **Iterator**, and a **Send Email** step.',
      'It is ready to run now, and filters or email copy can be refined next.',
    ],
    responseChips: [],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'workflow',
        running: 'Designing the workflow',
        done: 'Designed 3 steps',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'mail',
        running: 'Activating the sequence',
        done: 'Activated sequence',
        durationMs: 800,
      },
    ],
  },
];

export const ANTHROPIC_RECORD_PAGE: RecordPageDefinition = {
  type: 'record',
  header: {
    title: 'Anthropic',
    count: 12,
  },
  record: {
    logoDomain: 'anthropic.com',
    name: 'Anthropic',
    createdAt: 'Created 4 hours ago',
    fields: [
      {
        icon: 'link',
        label: 'URL',
        value: { type: 'link', kind: 'url', value: 'anthropic.com' },
      },
      {
        icon: 'user',
        label: 'Account Owner',
        value: {
          type: 'person',
          name: 'Dario Amodei',
          avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          kind: 'person',
          tone: 'gray',
        },
      },
      {
        icon: 'mapPin',
        label: 'Address',
        value: { type: 'text', value: '18 Rue De Navarin' },
      },
      {
        icon: 'check',
        label: 'ICP',
        value: { type: 'boolean', value: true },
      },
      {
        icon: 'currency',
        label: 'ARR',
        value: { type: 'currency', value: '$500,000' },
      },
      {
        icon: 'linkedin',
        label: 'LinkedIn',
        value: {
          type: 'link',
          kind: 'social',
          label: 'linkedin.com/company/a...',
          value: 'anthropic',
        },
      },
    ],
    moreCount: 12,
    relations: [
      {
        title: 'Opportunities',
        items: [{ name: 'Enterprise Expansion', domain: 'anthropic.com' }],
      },
      {
        title: 'People',
        count: 12,
        items: [
          {
            name: 'Dario Amodei',
            avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          },
        ],
      },
    ],
  },
  notes: [
    {
      id: 'kickoff',
      title: 'Kickoff with Dario',
      body: 'Walked through the enterprise expansion plan and the security review timeline. Anthropic wants SSO, audit logs, and a dedicated environment before rolling out to the wider research org.',
      relation: {
        name: 'Dario Amodei',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
      },
    },
    {
      id: 'pricing-follow-up',
      title: 'Follow-up on pricing',
      body: 'Shared updated seat pricing and the annual commitment options. Next step is a procurement intro and a technical deep-dive with their platform team.',
    },
  ],
  timeline: [
    {
      kind: 'calendar',
      id: 'calendar-security-review',
      actor: 'Alice',
      title: 'Security review',
      detail: 'Tomorrow · 10:00 – 10:45 AM · Dario Amodei, Alice',
      time: '1 hour ago',
    },
    {
      kind: 'note',
      id: 'note-kickoff',
      actor: 'Alice',
      title: 'Kickoff with Dario',
      time: '2 hours ago',
    },
    {
      kind: 'updated',
      id: 'update-multi',
      actor: 'Alice',
      record: 'Anthropic',
      time: '3 hours ago',
      diffs: [
        { label: 'Industry', value: { type: 'select', value: 'AI Research' } },
        { label: 'Employees', value: { type: 'text', value: '612' } },
        { label: 'ICP', value: { type: 'boolean', value: true } },
      ],
    },
    {
      kind: 'updated',
      id: 'update-arr',
      actor: 'Alice',
      record: 'Anthropic',
      time: '3 hours ago',
      diffs: [{ label: 'ARR', value: { type: 'currency', value: '$500,000' } }],
    },
    {
      kind: 'created',
      id: 'record-created',
      subject: 'Anthropic',
      actor: 'Dario Amodei',
      time: '4 hours ago',
    },
  ],
  tasks: [
    {
      id: 'task-agreement',
      title: 'Send enterprise agreement',
      body: 'Final redlines from legal',
      due: 'Tomorrow',
      target: {
        name: 'Dario Amodei',
        avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
        tone: 'gray',
      },
    },
    {
      id: 'task-security',
      title: 'Complete security review',
      body: 'SOC 2 and DPA sign-off',
      due: 'Friday',
      done: true,
      target: { name: 'Enterprise Expansion', domain: 'anthropic.com' },
    },
    {
      id: 'task-procurement',
      title: 'Schedule procurement intro',
      body: 'Loop in their procurement lead',
      due: 'Next week',
      target: { name: 'Alice', tone: 'amber' },
    },
  ],
  files: [
    {
      id: 'file-agreement',
      name: 'Enterprise Agreement.pdf',
      category: 'pdf',
      date: '2 hours ago',
    },
    {
      id: 'file-security',
      name: 'Security Review.xlsx',
      category: 'sheet',
      date: '1 day ago',
    },
    {
      id: 'file-pricing',
      name: 'Pricing Proposal.pdf',
      category: 'pdf',
      date: '3 days ago',
    },
  ],
  emails: [
    {
      id: 'email-expansion',
      participants: [
        {
          name: 'Dario Amodei',
          avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          tone: 'gray',
        },
        { name: 'Alice', tone: 'amber' },
      ],
      count: 3,
      subject: 'Re: Enterprise expansion',
      body: 'Thanks for the detailed proposal — looping in our platform team.',
      date: '2 hours ago',
    },
    {
      id: 'email-compliance',
      participants: [
        { name: 'Alice', tone: 'amber' },
        {
          name: 'Dario Amodei',
          avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          tone: 'gray',
        },
      ],
      count: 2,
      subject: 'Security & compliance docs',
      body: 'Attaching the SOC 2 report and our DPA for review.',
      date: '1 day ago',
    },
    {
      id: 'email-procurement',
      participants: [
        {
          name: 'Dario Amodei',
          avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          tone: 'gray',
        },
      ],
      count: 1,
      subject: 'Intro to procurement',
      body: 'Connecting you with our procurement lead to move the contract forward.',
      date: '2 days ago',
    },
  ],
  calendar: [
    {
      id: 'cal-day-wed',
      weekday: 'Wed',
      day: '12',
      events: [
        {
          id: 'cal-security',
          start: '10:00',
          end: '10:45',
          title: 'Security review',
          attending: true,
          participants: [
            {
              name: 'Dario Amodei',
              avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
              tone: 'gray',
            },
            { name: 'Alice', tone: 'amber' },
          ],
        },
      ],
    },
    {
      id: 'cal-day-fri',
      weekday: 'Fri',
      day: '14',
      events: [
        {
          id: 'cal-qbr',
          start: '14:00',
          end: '15:00',
          title: 'Quarterly business review',
          participants: [
            {
              name: 'Dario Amodei',
              avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
              tone: 'gray',
            },
            { name: 'Alice', tone: 'amber' },
            {
              name: 'Marcus Lee',
              avatarUrl: SHARED_PEOPLE_AVATAR_URLS.anonymousMike,
              tone: 'amber',
            },
          ],
        },
      ],
    },
  ],
};
