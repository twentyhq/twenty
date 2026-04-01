export type HomeVisualBrand =
  | 'accel'
  | 'airbnb'
  | 'anthropic'
  | 'apple'
  | 'ben-chestnut'
  | 'claude'
  | 'figma'
  | 'founders-fund'
  | 'github'
  | 'google'
  | 'linkedin'
  | 'mailchimp'
  | 'notion'
  | 'page-layout'
  | 'qonto'
  | 'sequoia'
  | 'segment'
  | 'slack'
  | 'stripe'
  | 'to-follow'
  | 'workflow'
  | 'workflow-run'
  | 'workflow-version';

export type HomeVisualColumnKey =
  | 'company'
  | 'url'
  | 'createdBy'
  | 'address'
  | 'accountOwner'
  | 'icp'
  | 'arr'
  | 'linkedin'
  | 'industry'
  | 'mainContact'
  | 'employees'
  | 'opportunities'
  | 'added';

export type HomeVisualColumn = {
  key: HomeVisualColumnKey;
  label: string;
  width: number;
  align?: 'left' | 'right';
};

export type HomeVisualSidebarIcon =
  | {
      kind: 'brand';
      brand: HomeVisualBrand;
      overlay?: 'link';
    }
  | {
      kind: 'tabler';
      name:
        | 'book'
        | 'buildingSkyscraper'
        | 'box'
        | 'checkbox'
        | 'folder'
        | 'notes'
        | 'playerPlay'
        | 'settings'
        | 'settingsAutomation'
        | 'targetArrow'
        | 'user'
        | 'versions';
      tone:
        | 'amber'
        | 'blue'
        | 'gray'
        | 'green'
        | 'orange'
        | 'pink'
        | 'purple'
        | 'teal';
      overlay?: 'link';
    }
  | {
      kind: 'avatar';
      label: string;
      tone: 'amber' | 'gray' | 'pink' | 'teal' | 'violet';
      shape?: 'circle' | 'square';
    };

export type HomeVisualSidebarItem = {
  id: string;
  icon: HomeVisualSidebarIcon;
  label: string;
  meta?: string;
  active?: boolean;
  children?: HomeVisualSidebarItem[];
  showChevron?: boolean;
};

export type HomeVisualPersonToken = {
  kind: 'api' | 'person' | 'system' | 'workflow';
  label: string;
  avatarUrl?: string;
  shortLabel?: string;
  tone:
    | 'amber'
    | 'blue'
    | 'gray'
    | 'green'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal';
};

export type HomeVisualRow = {
  id: string;
  companyBrand: HomeVisualBrand;
  companyLabel: string;
  url: string;
  createdBy: HomeVisualPersonToken;
  address: string;
  accountOwner: HomeVisualPersonToken;
  icp: boolean;
  arr: string;
  linkedin: string;
  industry: string;
  mainContact: HomeVisualPersonToken;
  employees: string;
  opportunities: HomeVisualPersonToken[];
  added: string;
};

const PEOPLE_AVATAR_URLS = {
  craigFederighi:
    'https://twentyhq.github.io/placeholder-images/people/image-33.png',
  eddyCue:
    'https://twentyhq.github.io/placeholder-images/people/image-18.png',
  jeffWilliams:
    'https://twentyhq.github.io/placeholder-images/people/image-22.png',
  katherineAdams:
    'https://twentyhq.github.io/placeholder-images/people/image-07.png',
  philSchiller:
    'https://twentyhq.github.io/placeholder-images/people/image-14.png',
  timCook:
    'https://twentyhq.github.io/placeholder-images/people/image-27.png',
} as const;

export const HOME_VISUAL_WORKSPACE_NAME = 'Apple';
export const HOME_VISUAL_BREADCRUMB_LABEL = 'Companies';
export const HOME_VISUAL_VIEW_LABEL = 'All Companies';
export const HOME_VISUAL_VIEW_COUNT = 9;
export const HOME_VISUAL_TABLE_TOTAL_WIDTH = 1700;

export const HOME_VISUAL_COLUMNS: HomeVisualColumn[] = [
  { key: 'company', label: 'Companies', width: 180 },
  { key: 'url', label: 'Url', width: 140 },
  { key: 'createdBy', label: 'Created By', width: 150 },
  { key: 'address', label: 'Address', width: 120 },
  { key: 'accountOwner', label: 'Account Owner', width: 150 },
  { key: 'icp', label: 'ICP', width: 80 },
  { key: 'arr', label: 'ARR', width: 120, align: 'right' },
  { key: 'linkedin', label: 'Linkedin', width: 96 },
  { key: 'industry', label: 'Industry', width: 96 },
  { key: 'mainContact', label: 'Main contact', width: 120 },
  { key: 'employees', label: 'Employees', width: 120, align: 'right' },
  { key: 'opportunities', label: 'Opportunities', width: 122 },
  { key: 'added', label: 'Added', width: 120 },
];

export const HOME_VISUAL_ROWS: HomeVisualRow[] = [
  {
    id: 'anthropic',
    companyBrand: 'anthropic',
    companyLabel: 'Anthropic',
    url: 'qonto.com',
    createdBy: {
      kind: 'person',
      label: 'Jeff Williams',
      tone: 'blue',
      avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
    },
    address: '18 Rue De Navarin',
    accountOwner: {
      kind: 'person',
      label: 'Phil Schiller',
      tone: 'amber',
      avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
    },
    icp: true,
    arr: '$500,000',
    linkedin: 'anthropic',
    industry: 'AI Research',
    mainContact: {
      kind: 'person',
      label: 'Dario Amodei',
      shortLabel: 'D',
      tone: 'gray',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-11.png',
    },
    employees: '612',
    opportunities: [
      {
        kind: 'person',
        label: 'Enterprise Expansion',
        shortLabel: 'E',
        tone: 'blue',
      },
    ],
    added: 'Jul 1, 2023',
  },
  {
    id: 'linkedin',
    companyBrand: 'linkedin',
    companyLabel: 'Linkedin',
    url: 'linkedin.com',
    createdBy: {
      kind: 'person',
      label: 'Craig Federighi',
      tone: 'purple',
      avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
    },
    address: '1226 Moises Causeway',
    accountOwner: {
      kind: 'person',
      label: 'Craig Federighi',
      tone: 'purple',
      avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
    },
    icp: false,
    arr: '$1,000,000',
    linkedin: 'linkedin',
    industry: 'Professional Networking',
    mainContact: {
      kind: 'person',
      label: 'Ryan Roslansky',
      shortLabel: 'R',
      tone: 'teal',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-26.png',
    },
    employees: '19,300',
    opportunities: [
      {
        kind: 'person',
        label: 'Talent Outreach',
        shortLabel: 'T',
        tone: 'purple',
      },
    ],
    added: 'Jul 3, 2023',
  },
  {
    id: 'slack',
    companyBrand: 'slack',
    companyLabel: 'Slack',
    url: 'slack.com',
    createdBy: {
      kind: 'person',
      label: 'Eddy Cue',
      tone: 'gray',
      avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
    },
    address: '1316 Dameon Mountain',
    accountOwner: {
      kind: 'person',
      label: 'Katherine Adams',
      tone: 'red',
      avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
    },
    icp: true,
    arr: '$2,300,000',
    linkedin: 'slack',
    industry: 'Collaboration Software',
    mainContact: {
      kind: 'person',
      label: 'Lidiane Jones',
      shortLabel: 'LJ',
      tone: 'pink',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-04.png',
    },
    employees: '4,500',
    opportunities: [
      {
        kind: 'person',
        label: 'Workspace Renewal',
        shortLabel: 'W',
        tone: 'teal',
      },
    ],
    added: 'Jul 5, 2023',
  },
  {
    id: 'notion',
    companyBrand: 'notion',
    companyLabel: 'Notion',
    url: 'notion.com',
    createdBy: {
      kind: 'api',
      label: 'API - Key name',
      shortLabel: 'API',
      tone: 'gray',
    },
    address: '1162 Sammy Creek',
    accountOwner: {
      kind: 'person',
      label: 'Phil Schiller',
      tone: 'amber',
      avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
    },
    icp: false,
    arr: '$750,000',
    linkedin: 'notion',
    industry: 'Productivity Software',
    mainContact: {
      kind: 'person',
      label: 'Ivan Zhao',
      shortLabel: 'I',
      tone: 'gray',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-09.png',
    },
    employees: '620',
    opportunities: [
      {
        kind: 'person',
        label: 'Workspace Consolidation',
        shortLabel: 'W',
        tone: 'gray',
      },
    ],
    added: 'Jul 8, 2023',
  },
  {
    id: 'figma',
    companyBrand: 'figma',
    companyLabel: 'Figma',
    url: 'figma.com',
    createdBy: {
      kind: 'workflow',
      label: 'Workflow name',
      shortLabel: 'WF',
      tone: 'gray',
    },
    address: '110 Oswald Junction',
    accountOwner: {
      kind: 'person',
      label: 'Tim Cook',
      tone: 'teal',
      avatarUrl: PEOPLE_AVATAR_URLS.timCook,
    },
    icp: true,
    arr: '$3,500,000',
    linkedin: 'figma',
    industry: 'Design Tools',
    mainContact: {
      kind: 'person',
      label: 'Dylan Field',
      shortLabel: 'D',
      tone: 'purple',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-31.png',
    },
    employees: '1,300',
    opportunities: [
      {
        kind: 'person',
        label: 'AI Prototyping',
        shortLabel: 'AI',
        tone: 'purple',
      },
      {
        kind: 'person',
        label: 'Design Ops',
        shortLabel: 'D',
        tone: 'teal',
      },
    ],
    added: 'Jul 12, 2023',
  },
  {
    id: 'github',
    companyBrand: 'github',
    companyLabel: 'Github',
    url: 'github.com',
    createdBy: {
      kind: 'person',
      label: 'Jeff Williams',
      tone: 'blue',
      avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
    },
    address: '3891 Ranchview Drive',
    accountOwner: {
      kind: 'person',
      label: 'Jeff Williams',
      tone: 'blue',
      avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
    },
    icp: true,
    arr: '$900,000',
    linkedin: 'github',
    industry: 'Developer Platform',
    mainContact: {
      kind: 'person',
      label: 'Thomas Dohmke',
      shortLabel: 'T',
      tone: 'gray',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-24.png',
    },
    employees: '3,800',
    opportunities: [
      {
        kind: 'person',
        label: 'Copilot Rollout',
        shortLabel: 'C',
        tone: 'blue',
      },
    ],
    added: 'Jul 14, 2023',
  },
  {
    id: 'airbnb',
    companyBrand: 'airbnb',
    companyLabel: 'Airbnb',
    url: 'airbnb.com',
    createdBy: {
      kind: 'person',
      label: 'Tim Cook',
      tone: 'teal',
      avatarUrl: PEOPLE_AVATAR_URLS.timCook,
    },
    address: '4517 Washington Avenue',
    accountOwner: {
      kind: 'person',
      label: 'Eddy Cue',
      tone: 'gray',
      avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
    },
    icp: true,
    arr: '$4,200,000',
    linkedin: 'airbnb',
    industry: 'Travel',
    mainContact: {
      kind: 'person',
      label: 'Brian Chesky',
      shortLabel: 'B',
      tone: 'pink',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-01.png',
    },
    employees: '6,900',
    opportunities: [
      {
        kind: 'person',
        label: 'Host Ops',
        shortLabel: 'H',
        tone: 'pink',
      },
    ],
    added: 'Jul 15, 2023',
  },
  {
    id: 'stripe',
    companyBrand: 'stripe',
    companyLabel: 'Stripe',
    url: 'stripe.com',
    createdBy: {
      kind: 'person',
      label: 'Katherine Adams',
      tone: 'red',
      avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
    },
    address: '2118 Thornridge Circle',
    accountOwner: {
      kind: 'person',
      label: 'Tim Cook',
      tone: 'teal',
      avatarUrl: PEOPLE_AVATAR_URLS.timCook,
    },
    icp: true,
    arr: '$1,800,000',
    linkedin: 'stripe',
    industry: 'Payments',
    mainContact: {
      kind: 'person',
      label: 'Patrick Collison',
      shortLabel: 'P',
      tone: 'blue',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-16.png',
    },
    employees: '7,400',
    opportunities: [
      {
        kind: 'person',
        label: 'Billing Expansion',
        shortLabel: 'B',
        tone: 'purple',
      },
    ],
    added: 'Jul 17, 2023',
  },
  {
    id: 'sequoia',
    companyBrand: 'sequoia',
    companyLabel: 'Sequoia',
    url: 'sequoia.com',
    createdBy: {
      kind: 'person',
      label: 'Phil Schiller',
      tone: 'amber',
      avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
    },
    address: '1316 Dameon Mountain',
    accountOwner: {
      kind: 'person',
      label: 'Phil Schiller',
      tone: 'amber',
      avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
    },
    icp: false,
    arr: '$6,000,000',
    linkedin: 'sequoia',
    industry: 'Venture Capital',
    mainContact: {
      kind: 'person',
      label: 'Roelof Botha',
      shortLabel: 'R',
      tone: 'green',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-13.png',
    },
    employees: '1,100',
    opportunities: [
      {
        kind: 'person',
        label: 'Fund Ops',
        shortLabel: 'F',
        tone: 'green',
      },
    ],
    added: 'Jul 20, 2023',
  },
  {
    id: 'segment',
    companyBrand: 'segment',
    companyLabel: 'Segment',
    url: 'segment.com',
    createdBy: {
      kind: 'person',
      label: 'Phil Schiller',
      tone: 'amber',
      avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
    },
    address: '8502 Preston Rd. East',
    accountOwner: {
      kind: 'person',
      label: 'Eddy Cue',
      tone: 'gray',
      avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
    },
    icp: true,
    arr: '$2,750,000',
    linkedin: 'segment',
    industry: 'Customer Data',
    mainContact: {
      kind: 'person',
      label: 'Peter Reinhardt',
      shortLabel: 'P',
      tone: 'teal',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-20.png',
    },
    employees: '1,550',
    opportunities: [
      {
        kind: 'person',
        label: 'Warehouse Rollout',
        shortLabel: 'W',
        tone: 'teal',
      },
    ],
    added: 'Jul 21, 2023',
  },
  {
    id: 'mailchimp',
    companyBrand: 'mailchimp',
    companyLabel: 'Mailchimp',
    url: 'mailchimp.com',
    createdBy: {
      kind: 'person',
      label: 'Eddy Cue',
      tone: 'gray',
      avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
    },
    address: '3517 W. Gray St.',
    accountOwner: {
      kind: 'person',
      label: 'Craig Federighi',
      tone: 'purple',
      avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
    },
    icp: false,
    arr: '$1,250,000',
    linkedin: 'mailchimp',
    industry: 'Marketing Automation',
    mainContact: {
      kind: 'person',
      label: 'Rania Succar',
      shortLabel: 'R',
      tone: 'amber',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-28.png',
    },
    employees: '1,900',
    opportunities: [
      {
        kind: 'person',
        label: 'Lifecycle Campaigns',
        shortLabel: 'L',
        tone: 'amber',
      },
    ],
    added: 'Jul 23, 2023',
  },
  {
    id: 'accel',
    companyBrand: 'accel',
    companyLabel: 'Accel',
    url: 'accel.com',
    createdBy: {
      kind: 'person',
      label: 'Craig Federighi',
      tone: 'purple',
      avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
    },
    address: '4140 Parker Rd.',
    accountOwner: {
      kind: 'person',
      label: 'Katherine Adams',
      tone: 'red',
      avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
    },
    icp: true,
    arr: '$5,800,000',
    linkedin: 'accel',
    industry: 'Venture Capital',
    mainContact: {
      kind: 'person',
      label: 'Ping Li',
      shortLabel: 'P',
      tone: 'purple',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-30.png',
    },
    employees: '540',
    opportunities: [
      {
        kind: 'person',
        label: 'Portfolio Sync',
        shortLabel: 'P',
        tone: 'purple',
      },
    ],
    added: 'Jul 24, 2023',
  },
  {
    id: 'founders-fund',
    companyBrand: 'founders-fund',
    companyLabel: 'Founders Fund',
    url: 'foundersfund.com',
    createdBy: {
      kind: 'system',
      label: 'System',
      shortLabel: 'SYS',
      tone: 'gray',
    },
    address: '2715 Ash Dr. San Jose',
    accountOwner: {
      kind: 'person',
      label: 'Tim Cook',
      tone: 'teal',
      avatarUrl: PEOPLE_AVATAR_URLS.timCook,
    },
    icp: true,
    arr: '$2,100,000',
    linkedin: 'foundersfund',
    industry: 'Private Equity',
    mainContact: {
      kind: 'person',
      label: 'Peter Thiel',
      shortLabel: 'P',
      tone: 'gray',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-05.png',
    },
    employees: '734',
    opportunities: [
      {
        kind: 'person',
        label: 'Fundraising',
        shortLabel: 'F',
        tone: 'gray',
      },
    ],
    added: 'Jul 25, 2023',
  },
  {
    id: 'google',
    companyBrand: 'google',
    companyLabel: 'Google',
    url: 'google.com',
    createdBy: {
      kind: 'person',
      label: 'Tim Cook',
      tone: 'teal',
      avatarUrl: PEOPLE_AVATAR_URLS.timCook,
    },
    address: '4140 Parker Rd.',
    accountOwner: {
      kind: 'person',
      label: 'Jeff Williams',
      tone: 'blue',
      avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
    },
    icp: false,
    arr: '$7,500,000',
    linkedin: 'google',
    industry: 'Computer Software',
    mainContact: {
      kind: 'person',
      label: 'Sundar Pichai',
      shortLabel: 'S',
      tone: 'teal',
      avatarUrl: 'https://twentyhq.github.io/placeholder-images/people/image-32.png',
    },
    employees: '734',
    opportunities: [
      {
        kind: 'person',
        label: 'Google AI and Data Solutions',
        shortLabel: 'G',
        tone: 'teal',
      },
      {
        kind: 'person',
        label: 'Relation 2',
        shortLabel: 'L',
        tone: 'teal',
      },
      {
        kind: 'person',
        label: 'Relation 3',
        shortLabel: 'L',
        tone: 'teal',
      },
    ],
    added: 'Jul 1, 2023 2:25 pm',
  },
];

export const HOME_VISUAL_FAVORITES: HomeVisualSidebarItem[] = [
  {
    id: 'to-follow',
    label: 'To Follow',
    icon: { kind: 'tabler', name: 'folder', tone: 'orange' },
    children: [
      {
        id: 'favorite-stripe',
        label: 'Stripe',
        meta: 'Company',
        icon: { kind: 'brand', brand: 'stripe' },
      },
      {
        id: 'favorite-airbnb',
        label: 'Airbnb',
        meta: 'Company',
        icon: { kind: 'brand', brand: 'airbnb' },
      },
      {
        id: 'favorite-brian',
        label: 'Brian Chesky',
        meta: 'Person',
        icon: { kind: 'avatar', label: 'B', tone: 'violet', shape: 'circle' },
      },
    ],
    showChevron: true,
  },
  {
    id: 'all-companies',
    label: 'All Companies',
    icon: { kind: 'tabler', name: 'buildingSkyscraper', tone: 'blue' },
  },
  {
    id: 'send-nda',
    label: 'Send NDA to Qonto - T...',
    icon: { kind: 'avatar', label: 'L', tone: 'teal', shape: 'circle' },
  },
  {
    id: 'page-layout',
    label: 'Page Layout',
    icon: { kind: 'brand', brand: 'page-layout' },
  },
  {
    id: 'favorite-figma',
    label: 'Figma',
    meta: 'Company',
    icon: { kind: 'brand', brand: 'figma' },
  },
  {
    id: 'favorite-ben',
    label: 'Ben Chestnut',
    meta: 'Person',
    icon: { kind: 'brand', brand: 'ben-chestnut' },
  },
];

export const HOME_VISUAL_WORKSPACE: HomeVisualSidebarItem[] = [
  {
    id: 'companies',
    label: 'Companies',
    icon: { kind: 'tabler', name: 'buildingSkyscraper', tone: 'blue' },
    active: true,
  },
  {
    id: 'people',
    label: 'People',
    icon: { kind: 'tabler', name: 'user', tone: 'purple' },
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: { kind: 'tabler', name: 'targetArrow', tone: 'pink' },
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: { kind: 'tabler', name: 'checkbox', tone: 'teal' },
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: { kind: 'tabler', name: 'notes', tone: 'green' },
  },
  {
    id: 'sales-dashboard',
    label: 'Sales Dashboard',
    meta: 'Dashboard',
    icon: { kind: 'avatar', label: '$', tone: 'amber', shape: 'circle' },
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'orange' },
    showChevron: true,
    children: [
      {
        id: 'workflow-list',
        label: 'Workflows',
        icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'gray' },
      },
      {
        id: 'workflow-runs',
        label: 'Workflows runs',
        icon: { kind: 'tabler', name: 'playerPlay', tone: 'gray' },
      },
      {
        id: 'workflow-versions',
        label: 'Workflows versions',
        icon: { kind: 'tabler', name: 'versions', tone: 'gray' },
      },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    icon: { kind: 'brand', brand: 'claude', overlay: 'link' },
  },
  {
    id: 'workspace-stripe',
    label: 'Stripe',
    icon: { kind: 'brand', brand: 'stripe' },
    showChevron: true,
  },
];

export const HOME_VISUAL_OTHER: HomeVisualSidebarItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: { kind: 'tabler', name: 'settings', tone: 'gray' },
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: { kind: 'tabler', name: 'book', tone: 'gray' },
  },
  {
    id: 'app-store',
    label: 'App store',
    icon: { kind: 'tabler', name: 'box', tone: 'gray' },
  },
];

export const HOME_VISUAL_ACTIONS = ['Filter', 'Sort', 'Options'];
