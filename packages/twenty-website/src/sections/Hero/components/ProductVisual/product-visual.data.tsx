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

export type ProductVisualSceneKind =
  | 'leadCreation'
  | 'opportunityReview'
  | 'taskCreation'
  | 'recordSummary'
  | 'workflowCreation';

export type ProductVisualSceneDefinition = {
  initialPageItemId: string;
  kind: ProductVisualSceneKind;
  label: string;
  responseChips: ResponseChip[];
  responseText: string;
  sidebarMode?: 'collapsed' | 'expanded';
  followUpPageItemId?: string;
};

export const COMPANIES_PAGE_ITEM_ID = 'companies';
export const PEOPLE_PAGE_ITEM_ID = 'people';
export const OPPORTUNITIES_PAGE_ITEM_ID = 'opportunities';
export const TASKS_PAGE_ITEM_ID = 'tasks';
export const WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID =
  'workflow-send-email-sequence';

export const PRODUCT_VISUAL_SCENES: ProductVisualSceneDefinition[] = [
  {
    initialPageItemId: COMPANIES_PAGE_ITEM_ID,
    kind: 'leadCreation',
    label: 'Add a new lead',
    followUpPageItemId: PEOPLE_PAGE_ITEM_ID,
    responseText:
      '**OpenAI** is now in Companies with openai.com, AI Research, and **$2.0M ARR**. **Sam Altman** was added in People as CEO in San Francisco and linked back to OpenAI as the main contact.',
    responseChips: [
      { name: 'OpenAI', logoUrl: SHARED_COMPANY_LOGO_URLS.openai },
    ],
    sidebarMode: 'expanded',
  },
  {
    initialPageItemId: OPPORTUNITIES_PAGE_ITEM_ID,
    kind: 'opportunityReview',
    label: 'Set up a view for deals closing this month',
    responseText:
      'Created a view for the **7 deals** closing this month, worth **$12.9M total**. Biggest are Host Ops at **$4.2M** and AI Prototyping at **$3.5M**, with the rest spread across Anthropic, Notion, Github, Stripe, and Mailchimp.',
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
  },
  {
    initialPageItemId: TASKS_PAGE_ITEM_ID,
    kind: 'taskCreation',
    label:
      'Generate follow-up tasks for my top 10 accounts using notes to gather context',
    responseText:
      'Created **10 follow-up tasks** dated **Nov 1 through Nov 8**. The first rows cover Anthropic, Slack, Figma, Notion, and Github, followed by Airbnb, Stripe, Sequoia, Accel, and Google.',
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
  },
  {
    initialPageItemId: COMPANIES_PAGE_ITEM_ID,
    kind: 'recordSummary',
    label: 'Summarize Qonto account history',
    responseText:
      'Qonto has **3 notes** centered on a benefits-led pitch, **Q Global Holdings** as the parent account, and **1 active opportunity**. The latest follow-up is with **Alexandre Prot**, and the history points to customer-service and operations as the main buying angles.',
    responseChips: [{ name: 'Qonto', logoUrl: SHARED_COMPANY_LOGO_URLS.qonto }],
    sidebarMode: 'collapsed',
  },
  {
    initialPageItemId: WORKFLOW_EMAIL_SEQUENCE_PAGE_ITEM_ID,
    kind: 'workflowCreation',
    label: 'Draft a workflow that sends an email sequence',
    responseText:
      'Created and activated a sequence with a **Manual trigger**, an **Iterator**, and a **Send Email** step. It is ready to run now, and filters or email copy can be refined next.',
    responseChips: [],
    sidebarMode: 'collapsed',
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

export const QONTO_RECORD_PAGE_INITIAL: RecordPageDefinition = {
  ...QONTO_RECORD_PAGE,
  record: {
    ...QONTO_RECORD_PAGE.record,
    relations: [
      QONTO_RECORD_PAGE.record.relations[0],
      QONTO_RECORD_PAGE.record.relations[1],
      {
        ...QONTO_RECORD_PAGE.record.relations[2],
        items: QONTO_RECORD_PAGE.record.relations[2].items.slice(0, 1),
      },
    ],
  },
  notes: QONTO_RECORD_PAGE.notes.slice(0, 1),
};

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
              name: 'Sam Altman',
              avatarUrl: SHARED_PEOPLE_AVATAR_URLS.samAltman,
              tone: 'amber',
            },
          ],
        },
      ],
    },
  ],
};
