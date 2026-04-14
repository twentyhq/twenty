import type {
  HeroDashboardDataType,
  HeroDashboardPageDefinition,
  HeroHomeDataType,
  HeroKanbanPageDefinition,
  HeroTablePageDefinition,
} from '@/sections/Hero/types';

const PEOPLE_AVATAR_URLS = {
  craigFederighi:
    'https://twentyhq.github.io/placeholder-images/people/image-33.png',
  eddyCue: 'https://twentyhq.github.io/placeholder-images/people/image-18.png',
  jeffWilliams:
    'https://twentyhq.github.io/placeholder-images/people/image-22.png',
  katherineAdams: '/images/home/hero/avatars/katherine-adams.jpg',
  philSchiller:
    'https://twentyhq.github.io/placeholder-images/people/image-14.png',
  timCook: 'https://twentyhq.github.io/placeholder-images/people/image-27.png',
} as const;

const SALES_DASHBOARD_DATA: HeroDashboardDataType = {
  metrics: [
    {
      id: 'new-subscriptions',
      title: 'New subscriptions',
      value: '2,432',
    },
    {
      id: 'churn',
      title: 'Churn',
      value: '161',
    },
    {
      id: 'churn-rate',
      title: 'Churn %',
      value: '6.6%',
    },
  ],
  visitsChart: {
    alt: 'Visits bar chart comparing this year and last year',
    height: 1116,
    src: '/images/home/hero/sales-dashboard/visits.webp',
    width: 2316,
  },
  revenueChart: {
    alt: 'Revenue line chart by month',
    height: 1116,
    src: '/images/home/hero/sales-dashboard/revenue.webp',
    width: 2316,
  },
  distributionChart: {
    alt: 'Ultra versus Plus donut chart distribution',
    height: 1116,
    src: '/images/home/hero/sales-dashboard/distribution.webp',
    width: 756,
  },
};

const SALES_DASHBOARD_PAGE: HeroDashboardPageDefinition = {
  type: 'dashboard',
  header: {
    title: 'Sales Dashboard',
  },
  dashboard: SALES_DASHBOARD_DATA,
};

const OPPORTUNITY_KANBAN_PAGE: HeroKanbanPageDefinition = {
  type: 'kanban',
  header: {
    title: 'Best leads',
  },
  lanes: [
    {
      id: 'identified',
      label: 'Identified',
      tone: 'pink',
      cards: [
        {
          id: 'anthropic-enterprise-expansion',
          title: 'Enterprise Expansion',
          amount: '$500,000',
          company: {
            type: 'entity',
            name: 'Anthropic',
            domain: 'anthropic.com',
          },
          accountOwner: {
            type: 'person',
            name: 'Phil Schiller',
            tone: 'amber',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
          },
          rating: 2,
          date: 'Jul 1, 2023',
          mainContact: {
            type: 'person',
            name: 'Dario Amodei',
            shortLabel: 'D',
            tone: 'gray',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-11.png',
          },
          recordId: 'OPP-1',
        },
        {
          id: 'figma-ai-prototyping',
          title: 'AI Prototyping',
          amount: '$3,500,000',
          company: { type: 'entity', name: 'Figma', domain: 'figma.com' },
          accountOwner: {
            type: 'person',
            name: 'Tim Cook',
            tone: 'teal',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.timCook,
          },
          rating: 2,
          date: 'Jul 12, 2023',
          mainContact: {
            type: 'person',
            name: 'Dylan Field',
            shortLabel: 'D',
            tone: 'purple',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-31.png',
          },
          recordId: 'OPP-2',
        },
      ],
    },
    {
      id: 'qualified',
      label: 'Qualified',
      tone: 'purple',
      cards: [
        {
          id: 'notion-workspace-consolidation',
          title: 'Workspace Consolidation',
          amount: '$750,000',
          company: { type: 'entity', name: 'Notion', domain: 'notion.com' },
          accountOwner: {
            type: 'person',
            name: 'Phil Schiller',
            tone: 'amber',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
          },
          rating: 4,
          date: 'Jul 8, 2023',
          mainContact: {
            type: 'person',
            name: 'Ivan Zhao',
            shortLabel: 'I',
            tone: 'gray',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-09.png',
          },
          recordId: 'OPP-3',
        },
      ],
    },
    {
      id: 'engaged',
      label: 'Engaged',
      tone: 'blue',
      cards: [
        {
          id: 'github-copilot-rollout',
          title: 'Copilot Rollout',
          amount: '$900,000',
          company: { type: 'entity', name: 'Github', domain: 'github.com' },
          accountOwner: {
            type: 'person',
            name: 'Jeff Williams',
            tone: 'blue',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
          },
          rating: 3,
          date: 'Jul 14, 2023',
          mainContact: {
            type: 'person',
            name: 'Thomas Dohmke',
            shortLabel: 'T',
            tone: 'gray',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-24.png',
          },
          recordId: 'OPP-4',
        },
        {
          id: 'stripe-billing-expansion',
          title: 'Billing Expansion',
          amount: '$1,800,000',
          company: { type: 'entity', name: 'Stripe', domain: 'stripe.com' },
          accountOwner: {
            type: 'person',
            name: 'Tim Cook',
            tone: 'teal',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.timCook,
          },
          rating: 5,
          date: 'Jul 17, 2023',
          mainContact: {
            type: 'person',
            name: 'Patrick Collison',
            shortLabel: 'P',
            tone: 'blue',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-16.png',
          },
          recordId: 'OPP-5',
        },
        {
          id: 'airbnb-host-ops',
          title: 'Host Ops',
          amount: '$4,200,000',
          company: { type: 'entity', name: 'Airbnb', domain: 'airbnb.com' },
          accountOwner: {
            type: 'person',
            name: 'Eddy Cue',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
          },
          rating: 3,
          date: 'Jul 15, 2023',
          mainContact: {
            type: 'person',
            name: 'Brian Chesky',
            shortLabel: 'B',
            tone: 'pink',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-01.png',
          },
          recordId: 'OPP-6',
        },
      ],
    },
    {
      id: 'proposed',
      label: 'Proposed',
      tone: 'green',
      cards: [],
    },
    {
      id: 'no-value',
      label: 'No Value',
      tone: 'gray',
      cards: [
        {
          id: 'mailchimp-lifecycle-campaigns',
          title: 'Lifecycle Campaigns',
          amount: '$1,250,000',
          company: {
            type: 'entity',
            name: 'Mailchimp',
            domain: 'mailchimp.com',
          },
          accountOwner: {
            type: 'person',
            name: 'Craig Federighi',
            tone: 'purple',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
          },
          rating: 4,
          date: 'Jul 23, 2023',
          mainContact: {
            type: 'person',
            name: 'Rania Succar',
            shortLabel: 'R',
            tone: 'amber',
            kind: 'person',
            avatarUrl:
              'https://twentyhq.github.io/placeholder-images/people/image-28.png',
          },
          recordId: 'OPP-7',
        },
      ],
    },
  ],
};

function createTablePage({
  title,
  count,
  columns,
  rows,
}: {
  title: string;
  count: number;
  columns: HeroTablePageDefinition['columns'];
  rows: HeroTablePageDefinition['rows'];
}): HeroTablePageDefinition {
  return {
    type: 'table',
    header: {
      title,
      count,
    },
    columns,
    rows,
  };
}

export const HERO_DATA: HeroHomeDataType = {
  heading: [
    { text: 'Build', fontFamily: 'sans' },
    { text: ' your Enterprise CRM ', fontFamily: 'serif' },
    { text: 'at AI Speed', fontFamily: 'sans' },
  ],
  body: {
    text: 'Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves.',
  },
  visual: {
    workspace: { icon: 'apple', name: 'Apple' },
    tableWidth: 1700,
    actions: ['Filter', 'Sort', 'Options'],
    favoritesNav: [
      {
        id: 'sales-dashboard',
        label: 'Sales Dashboard',
        icon: { kind: 'avatar', label: 'S', tone: 'amber', shape: 'circle' },
        meta: 'Dashboard',
        page: SALES_DASHBOARD_PAGE,
      },
    ],
    workspaceNav: [
      {
        id: 'companies',
        label: 'Companies',
        icon: { kind: 'tabler', name: 'buildingSkyscraper', tone: 'blue' },
        active: true,
        page: createTablePage({
          title: 'All Companies',
          count: 9,
          columns: [
            {
              id: 'company',
              label: 'Companies',
              width: 180,
              isFirstColumn: true,
            },
            { id: 'url', label: 'Url', width: 140 },
            { id: 'createdBy', label: 'Created By', width: 150 },
            { id: 'address', label: 'Address', width: 120 },
            { id: 'accountOwner', label: 'Account Owner', width: 150 },
            { id: 'icp', label: 'ICP', width: 80 },
            { id: 'arr', label: 'ARR', width: 120, align: 'right' },
            { id: 'linkedin', label: 'Linkedin', width: 96 },
            { id: 'industry', label: 'Industry', width: 96 },
            { id: 'mainContact', label: 'Main contact', width: 120 },
            { id: 'employees', label: 'Employees', width: 120, align: 'right' },
            { id: 'opportunities', label: 'Opportunities', width: 122 },
            { id: 'added', label: 'Added', width: 120 },
          ],
          rows: [
            {
              id: 'anthropic',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Anthropic',
                  domain: 'anthropic.com',
                },
                url: { type: 'link', value: 'qonto.com' },
                createdBy: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                address: { type: 'text', value: '18 Rue De Navarin' },
                accountOwner: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$500,000' },
                linkedin: { type: 'link', value: 'anthropic' },
                industry: { type: 'tag', value: 'AI Research' },
                mainContact: {
                  type: 'person',
                  name: 'Dario Amodei',
                  shortLabel: 'D',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-11.png',
                },
                employees: { type: 'number', value: '612' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Enterprise Expansion',
                      shortLabel: 'E',
                      tone: 'blue',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 1, 2023' },
              },
            },
            {
              id: 'linkedin',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Linkedin',
                  domain: 'linkedin.com',
                },
                url: { type: 'link', value: 'linkedin.com' },
                createdBy: {
                  type: 'person',
                  name: 'Craig Federighi',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
                },
                address: { type: 'text', value: '1226 Moises Causeway' },
                accountOwner: {
                  type: 'person',
                  name: 'Craig Federighi',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
                },
                icp: { type: 'boolean', value: false },
                arr: { type: 'number', value: '$1,000,000' },
                linkedin: { type: 'link', value: 'linkedin' },
                industry: { type: 'tag', value: 'Professional Networking' },
                mainContact: {
                  type: 'person',
                  name: 'Ryan Roslansky',
                  shortLabel: 'R',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-26.png',
                },
                employees: { type: 'number', value: '19,300' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Talent Outreach',
                      shortLabel: 'T',
                      tone: 'purple',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 3, 2023' },
              },
            },
            {
              id: 'slack',
              cells: {
                company: { type: 'entity', name: 'Slack', domain: 'slack.com' },
                url: { type: 'link', value: 'slack.com' },
                createdBy: {
                  type: 'person',
                  name: 'Eddy Cue',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
                },
                address: { type: 'text', value: '1316 Dameon Mountain' },
                accountOwner: {
                  type: 'person',
                  name: 'Katherine Adams',
                  tone: 'red',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$2,300,000' },
                linkedin: { type: 'link', value: 'slack' },
                industry: { type: 'tag', value: 'Collaboration Software' },
                mainContact: {
                  type: 'person',
                  name: 'Lidiane Jones',
                  shortLabel: 'LJ',
                  tone: 'pink',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-04.png',
                },
                employees: { type: 'number', value: '4,500' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Workspace Renewal',
                      shortLabel: 'W',
                      tone: 'teal',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 5, 2023' },
              },
            },
            {
              id: 'notion',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Notion',
                  domain: 'notion.com',
                },
                url: { type: 'link', value: 'notion.com' },
                createdBy: {
                  type: 'person',
                  name: 'API - Key name',
                  tone: 'gray',
                  kind: 'api',
                  shortLabel: 'API',
                },
                address: { type: 'text', value: '1162 Sammy Creek' },
                accountOwner: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                icp: { type: 'boolean', value: false },
                arr: { type: 'number', value: '$750,000' },
                linkedin: { type: 'link', value: 'notion' },
                industry: { type: 'tag', value: 'Productivity Software' },
                mainContact: {
                  type: 'person',
                  name: 'Ivan Zhao',
                  shortLabel: 'I',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-09.png',
                },
                employees: { type: 'number', value: '620' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Workspace Consolidation',
                      shortLabel: 'W',
                      tone: 'gray',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 8, 2023' },
              },
            },
            {
              id: 'figma',
              cells: {
                company: { type: 'entity', name: 'Figma', domain: 'figma.com' },
                url: { type: 'link', value: 'figma.com' },
                createdBy: {
                  type: 'person',
                  name: 'Workflow name',
                  tone: 'gray',
                  kind: 'workflow',
                  shortLabel: 'WF',
                },
                address: { type: 'text', value: '110 Oswald Junction' },
                accountOwner: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$3,500,000' },
                linkedin: { type: 'link', value: 'figma' },
                industry: { type: 'tag', value: 'Design Tools' },
                mainContact: {
                  type: 'person',
                  name: 'Dylan Field',
                  shortLabel: 'D',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-31.png',
                },
                employees: { type: 'number', value: '1,300' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'AI Prototyping',
                      shortLabel: 'AI',
                      tone: 'purple',
                    },
                    { name: 'Design Ops', shortLabel: 'D', tone: 'teal' },
                  ],
                },
                added: { type: 'text', value: 'Jul 12, 2023' },
              },
            },
            {
              id: 'github',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Github',
                  domain: 'github.com',
                },
                url: { type: 'link', value: 'github.com' },
                createdBy: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                address: { type: 'text', value: '3891 Ranchview Drive' },
                accountOwner: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$900,000' },
                linkedin: { type: 'link', value: 'github' },
                industry: { type: 'tag', value: 'Developer Platform' },
                mainContact: {
                  type: 'person',
                  name: 'Thomas Dohmke',
                  shortLabel: 'T',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-24.png',
                },
                employees: { type: 'number', value: '3,800' },
                opportunities: {
                  type: 'relation',
                  items: [
                    { name: 'Copilot Rollout', shortLabel: 'C', tone: 'blue' },
                  ],
                },
                added: { type: 'text', value: 'Jul 14, 2023' },
              },
            },
            {
              id: 'airbnb',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Airbnb',
                  domain: 'airbnb.com',
                },
                url: { type: 'link', value: 'airbnb.com' },
                createdBy: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                address: { type: 'text', value: '4517 Washington Avenue' },
                accountOwner: {
                  type: 'person',
                  name: 'Eddy Cue',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$4,200,000' },
                linkedin: { type: 'link', value: 'airbnb' },
                industry: { type: 'tag', value: 'Travel' },
                mainContact: {
                  type: 'person',
                  name: 'Brian Chesky',
                  shortLabel: 'B',
                  tone: 'pink',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-01.png',
                },
                employees: { type: 'number', value: '6,900' },
                opportunities: {
                  type: 'relation',
                  items: [{ name: 'Host Ops', shortLabel: 'H', tone: 'pink' }],
                },
                added: { type: 'text', value: 'Jul 15, 2023' },
              },
            },
            {
              id: 'stripe',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Stripe',
                  domain: 'stripe.com',
                },
                url: { type: 'link', value: 'stripe.com' },
                createdBy: {
                  type: 'person',
                  name: 'Katherine Adams',
                  tone: 'red',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
                },
                address: { type: 'text', value: '2118 Thornridge Circle' },
                accountOwner: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$1,800,000' },
                linkedin: { type: 'link', value: 'stripe' },
                industry: { type: 'tag', value: 'Payments' },
                mainContact: {
                  type: 'person',
                  name: 'Patrick Collison',
                  shortLabel: 'P',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-16.png',
                },
                employees: { type: 'number', value: '7,400' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Billing Expansion',
                      shortLabel: 'B',
                      tone: 'purple',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 17, 2023' },
              },
            },
            {
              id: 'sequoia',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Sequoia',
                  domain: 'sequoia.com',
                },
                url: { type: 'link', value: 'sequoia.com' },
                createdBy: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                address: { type: 'text', value: '1316 Dameon Mountain' },
                accountOwner: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                icp: { type: 'boolean', value: false },
                arr: { type: 'number', value: '$6,000,000' },
                linkedin: { type: 'link', value: 'sequoia' },
                industry: { type: 'tag', value: 'Venture Capital' },
                mainContact: {
                  type: 'person',
                  name: 'Roelof Botha',
                  shortLabel: 'R',
                  tone: 'green',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-13.png',
                },
                employees: { type: 'number', value: '1,100' },
                opportunities: {
                  type: 'relation',
                  items: [{ name: 'Fund Ops', shortLabel: 'F', tone: 'green' }],
                },
                added: { type: 'text', value: 'Jul 20, 2023' },
              },
            },
            {
              id: 'segment',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Segment',
                  domain: 'segment.com',
                },
                url: { type: 'link', value: 'segment.com' },
                createdBy: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                address: { type: 'text', value: '8502 Preston Rd. East' },
                accountOwner: {
                  type: 'person',
                  name: 'Eddy Cue',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$2,750,000' },
                linkedin: { type: 'link', value: 'segment' },
                industry: { type: 'tag', value: 'Customer Data' },
                mainContact: {
                  type: 'person',
                  name: 'Peter Reinhardt',
                  shortLabel: 'P',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-20.png',
                },
                employees: { type: 'number', value: '1,550' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Warehouse Rollout',
                      shortLabel: 'W',
                      tone: 'teal',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 21, 2023' },
              },
            },
            {
              id: 'mailchimp',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Mailchimp',
                  domain: 'mailchimp.com',
                },
                url: { type: 'link', value: 'mailchimp.com' },
                createdBy: {
                  type: 'person',
                  name: 'Eddy Cue',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
                },
                address: { type: 'text', value: '3517 W. Gray St.' },
                accountOwner: {
                  type: 'person',
                  name: 'Craig Federighi',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
                },
                icp: { type: 'boolean', value: false },
                arr: { type: 'number', value: '$1,250,000' },
                linkedin: { type: 'link', value: 'mailchimp' },
                industry: { type: 'tag', value: 'Marketing Automation' },
                mainContact: {
                  type: 'person',
                  name: 'Rania Succar',
                  shortLabel: 'R',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-28.png',
                },
                employees: { type: 'number', value: '1,900' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Lifecycle Campaigns',
                      shortLabel: 'L',
                      tone: 'amber',
                    },
                  ],
                },
                added: { type: 'text', value: 'Jul 23, 2023' },
              },
            },
            {
              id: 'accel',
              cells: {
                company: { type: 'entity', name: 'Accel', domain: 'accel.com' },
                url: { type: 'link', value: 'accel.com' },
                createdBy: {
                  type: 'person',
                  name: 'Craig Federighi',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
                },
                address: { type: 'text', value: '4140 Parker Rd.' },
                accountOwner: {
                  type: 'person',
                  name: 'Katherine Adams',
                  tone: 'red',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.katherineAdams,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$5,800,000' },
                linkedin: { type: 'link', value: 'accel' },
                industry: { type: 'tag', value: 'Venture Capital' },
                mainContact: {
                  type: 'person',
                  name: 'Ping Li',
                  shortLabel: 'P',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-30.png',
                },
                employees: { type: 'number', value: '540' },
                opportunities: {
                  type: 'relation',
                  items: [
                    { name: 'Portfolio Sync', shortLabel: 'P', tone: 'purple' },
                  ],
                },
                added: { type: 'text', value: 'Jul 24, 2023' },
              },
            },
            {
              id: 'founders-fund',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Founders Fund',
                  domain: 'foundersfund.com',
                },
                url: { type: 'link', value: 'foundersfund.com' },
                createdBy: {
                  type: 'person',
                  name: 'System',
                  tone: 'gray',
                  kind: 'system',
                  shortLabel: 'SYS',
                },
                address: { type: 'text', value: '2715 Ash Dr. San Jose' },
                accountOwner: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                icp: { type: 'boolean', value: true },
                arr: { type: 'number', value: '$2,100,000' },
                linkedin: { type: 'link', value: 'foundersfund' },
                industry: { type: 'tag', value: 'Private Equity' },
                mainContact: {
                  type: 'person',
                  name: 'Peter Thiel',
                  shortLabel: 'P',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-05.png',
                },
                employees: { type: 'number', value: '734' },
                opportunities: {
                  type: 'relation',
                  items: [
                    { name: 'Fundraising', shortLabel: 'F', tone: 'gray' },
                  ],
                },
                added: { type: 'text', value: 'Jul 25, 2023' },
              },
            },
            {
              id: 'google',
              cells: {
                company: {
                  type: 'entity',
                  name: 'Google',
                  domain: 'google.com',
                },
                url: { type: 'link', value: 'google.com' },
                createdBy: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                address: { type: 'text', value: '4140 Parker Rd.' },
                accountOwner: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                icp: { type: 'boolean', value: false },
                arr: { type: 'number', value: '$7,500,000' },
                linkedin: { type: 'link', value: 'google' },
                industry: { type: 'tag', value: 'Computer Software' },
                mainContact: {
                  type: 'person',
                  name: 'Sundar Pichai',
                  shortLabel: 'S',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl:
                    'https://twentyhq.github.io/placeholder-images/people/image-32.png',
                },
                employees: { type: 'number', value: '734' },
                opportunities: {
                  type: 'relation',
                  items: [
                    {
                      name: 'Google AI and Data Solutions',
                      shortLabel: 'G',
                      tone: 'teal',
                    },
                    { name: 'Relation 2', shortLabel: 'L', tone: 'teal' },
                    { name: 'Relation 3', shortLabel: 'L', tone: 'teal' },
                  ],
                },
                added: { type: 'text', value: 'Jul 1, 2023 2:25 pm' },
              },
            },
          ],
        }),
      },
      {
        id: 'people',
        label: 'People',
        icon: { kind: 'tabler', name: 'user', tone: 'blue' },
        page: createTablePage({
          title: 'All People',
          count: 5,
          columns: [
            { id: 'name', label: 'Name', width: 180, isFirstColumn: true },
            { id: 'company', label: 'Company', width: 160 },
            { id: 'email', label: 'Email', width: 200 },
            { id: 'phone', label: 'Phone', width: 160 },
            { id: 'jobTitle', label: 'Job Title', width: 160 },
            { id: 'city', label: 'City', width: 120 },
            { id: 'linkedin', label: 'Linkedin', width: 140 },
            { id: 'added', label: 'Added', width: 160 },
          ],
          rows: [
            {
              id: 'jeff-williams',
              cells: {
                name: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                company: {
                  type: 'entity',
                  name: 'Anthropic',
                  domain: 'anthropic.com',
                },
                email: { type: 'link', value: 'jeff@anthropic.com' },
                phone: { type: 'text', value: '+33 1 23 45 67 89' },
                jobTitle: { type: 'text', value: 'COO' },
                city: { type: 'text', value: 'Paris' },
                linkedin: { type: 'link', value: 'jeff-williams' },
                added: { type: 'text', value: 'Jul 3, 2023' },
              },
            },
            {
              id: 'craig-federighi',
              cells: {
                name: {
                  type: 'person',
                  name: 'Craig Federighi',
                  tone: 'purple',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.craigFederighi,
                },
                company: {
                  type: 'entity',
                  name: 'Linkedin',
                  domain: 'linkedin.com',
                },
                email: { type: 'link', value: 'craig@linkedin.com' },
                phone: { type: 'text', value: '+1 234 567 8900' },
                jobTitle: { type: 'text', value: 'SVP Software Engineering' },
                city: { type: 'text', value: 'Tabithaville' },
                linkedin: { type: 'link', value: 'craig-federighi' },
                added: { type: 'text', value: 'Jul 28, 2023' },
              },
            },
          ],
        }),
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: { kind: 'tabler', name: 'targetArrow', tone: 'red' },
        page: OPPORTUNITY_KANBAN_PAGE,
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: { kind: 'tabler', name: 'checkbox', tone: 'teal' },
        page: createTablePage({
          title: 'All Tasks',
          count: 2,
          columns: [
            { id: 'title', label: 'Title', width: 220, isFirstColumn: true },
            { id: 'assignee', label: 'Assignee', width: 160 },
            { id: 'dueDate', label: 'Due Date', width: 160 },
            { id: 'relatedTo', label: 'Related To', width: 160 },
            { id: 'status', label: 'Status', width: 140 },
          ],
          rows: [
            {
              id: 'send-nda',
              cells: {
                title: {
                  type: 'text',
                  value: 'Send NDA',
                  shortLabel: 'S',
                  tone: 'teal',
                },
                assignee: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                dueDate: { type: 'text', value: 'Oct 25, 2023' },
                relatedTo: {
                  type: 'entity',
                  name: 'Anthropic',
                  domain: 'anthropic.com',
                },
                status: { type: 'tag', value: 'To Do' },
              },
            },
            {
              id: 'review-proposal',
              cells: {
                title: {
                  type: 'text',
                  value: 'Review proposal',
                  shortLabel: 'R',
                  tone: 'teal',
                },
                assignee: {
                  type: 'person',
                  name: 'Eddy Cue',
                  tone: 'gray',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.eddyCue,
                },
                dueDate: { type: 'text', value: 'Oct 28, 2023' },
                relatedTo: {
                  type: 'entity',
                  name: 'Slack',
                  domain: 'slack.com',
                },
                status: { type: 'tag', value: 'In Progress' },
              },
            },
          ],
        }),
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: { kind: 'tabler', name: 'notes', tone: 'teal' },
        page: createTablePage({
          title: 'All Notes',
          count: 2,
          columns: [
            { id: 'title', label: 'Title', width: 240, isFirstColumn: true },
            { id: 'createdBy', label: 'Created By', width: 160 },
            { id: 'relatedTo', label: 'Related To', width: 160 },
            { id: 'added', label: 'Added', width: 180 },
          ],
          rows: [
            {
              id: 'discovery-call',
              cells: {
                title: {
                  type: 'text',
                  value: 'Discovery call notes',
                  shortLabel: 'D',
                  tone: 'green',
                },
                createdBy: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                relatedTo: {
                  type: 'entity',
                  name: 'Notion',
                  domain: 'notion.com',
                },
                added: { type: 'text', value: 'Sep 2, 2023' },
              },
            },
            {
              id: 'design-system-meeting',
              cells: {
                title: {
                  type: 'text',
                  value: 'Design system meeting',
                  shortLabel: 'D',
                  tone: 'green',
                },
                createdBy: {
                  type: 'person',
                  name: 'Tim Cook',
                  tone: 'teal',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.timCook,
                },
                relatedTo: {
                  type: 'entity',
                  name: 'Figma',
                  domain: 'figma.com',
                },
                added: { type: 'text', value: 'Oct 18, 2023' },
              },
            },
          ],
        }),
      },
      {
        id: 'dashboards',
        label: 'Dashboards',
        icon: { kind: 'tabler', name: 'layoutDashboard', tone: 'gray' },
        page: createTablePage({
          title: 'All Dashboards',
          count: 2,
          columns: [
            { id: 'name', label: 'Name', width: 240, isFirstColumn: true },
            { id: 'createdBy', label: 'Created By', width: 160 },
            { id: 'added', label: 'Last Edited', width: 160 },
          ],
          rows: [
            {
              id: 'sales-dashboard',
              cells: {
                name: {
                  type: 'text',
                  value: 'Sales Dashboard',
                  shortLabel: 'S',
                  targetLabel: 'Sales Dashboard',
                  tone: 'amber',
                },
                createdBy: {
                  type: 'person',
                  name: 'Phil Schiller',
                  tone: 'amber',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.philSchiller,
                },
                added: { type: 'text', value: 'Oct 24, 2023' },
              },
            },
            {
              id: 'pipeline-health',
              cells: {
                name: {
                  type: 'text',
                  value: 'Pipeline Health',
                  shortLabel: 'P',
                  tone: 'blue',
                },
                createdBy: {
                  type: 'person',
                  name: 'Jeff Williams',
                  tone: 'blue',
                  kind: 'person',
                  avatarUrl: PEOPLE_AVATAR_URLS.jeffWilliams,
                },
                added: { type: 'text', value: 'Oct 19, 2023' },
              },
            },
          ],
        }),
      },
      {
        id: 'workflows',
        label: 'Workflows',
        icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'orange' },
        showChevron: true,
        items: [
          {
            id: 'workflow-create-company-when-adding-a-new-person',
            label: 'Create company when adding a new person',
            icon: {
              color: '#451E11',
              kind: 'avatar',
              label: 'C',
              tone: 'orange',
              shape: 'circle',
            },
            page: {
              type: 'workflow',
              header: {
                navbarActions: [
                  { icon: 'chevronDown', variant: 'icon' },
                  { icon: 'chevronUp', variant: 'icon' },
                  { icon: 'heart', variant: 'icon' },
                  { icon: 'playerPause', label: 'Deactivate' },
                  { icon: 'repeat', label: 'See Runs' },
                  { icon: 'plus', label: 'Add a Node' },
                  { icon: 'dotsVertical', trailingLabel: '⌘K' },
                ],
                title: 'Create company when adding a new person',
              },
            },
          },
          {
            id: 'workflow-list',
            label: 'All Workflows',
            icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'gray' },
            page: createTablePage({
              title: 'All Workflows',
              count: 2,
              columns: [
                { id: 'name', label: 'Name', width: 240, isFirstColumn: true },
                { id: 'status', label: 'Status', width: 140 },
                { id: 'lastRun', label: 'Last Run', width: 200 },
              ],
              rows: [
                {
                  id: 'create-company-when-adding-a-new-person',
                  cells: {
                    name: {
                      type: 'text',
                      value: 'Create company when adding a new person',
                      shortLabel: 'C',
                      targetLabel: 'Create company when adding a new person',
                      tone: 'orange',
                    },
                    status: { type: 'tag', value: 'Active' },
                    lastRun: { type: 'text', value: 'Oct 24, 2023 10:00 am' },
                  },
                },
                {
                  id: 'nurture',
                  cells: {
                    name: {
                      type: 'text',
                      value: 'Nurture Sequence',
                      shortLabel: 'N',
                      tone: 'amber',
                    },
                    status: { type: 'tag', value: 'Inactive' },
                    lastRun: { type: 'text', value: 'Oct 20, 2023 3:15 pm' },
                  },
                },
              ],
            }),
          },
          {
            id: 'workflow-runs',
            label: 'Workflows runs',
            icon: { kind: 'tabler', name: 'playerPlay', tone: 'gray' },
            page: createTablePage({
              title: 'All Runs',
              count: 2,
              columns: [
                {
                  id: 'runId',
                  label: 'Run ID',
                  width: 160,
                  isFirstColumn: true,
                },
                { id: 'workflow', label: 'Workflow', width: 200 },
                { id: 'status', label: 'Status', width: 120 },
                { id: 'startedAt', label: 'Started At', width: 200 },
                { id: 'duration', label: 'Duration', width: 120 },
              ],
              rows: [
                {
                  id: 'run-12345',
                  cells: {
                    runId: {
                      type: 'text',
                      value: 'run_12345',
                      shortLabel: 'R',
                      tone: 'amber',
                    },
                    workflow: { type: 'text', value: 'New Lead Assignment' },
                    status: { type: 'tag', value: 'Success' },
                    startedAt: { type: 'text', value: 'Oct 24, 2023 10:00 am' },
                    duration: { type: 'text', value: '2s' },
                  },
                },
                {
                  id: 'run-12346',
                  cells: {
                    runId: {
                      type: 'text',
                      value: 'run_12346',
                      shortLabel: 'R',
                      tone: 'amber',
                    },
                    workflow: { type: 'text', value: 'Nurture Sequence' },
                    status: { type: 'tag', value: 'Failed' },
                    startedAt: { type: 'text', value: 'Oct 20, 2023 3:15 pm' },
                    duration: { type: 'text', value: '5s' },
                  },
                },
              ],
            }),
          },
          {
            id: 'workflow-versions',
            label: 'Workflows versions',
            icon: { kind: 'tabler', name: 'versions', tone: 'gray' },
            page: createTablePage({
              title: 'All Versions',
              count: 2,
              columns: [
                {
                  id: 'version',
                  label: 'Version',
                  width: 120,
                  isFirstColumn: true,
                },
                { id: 'workflow', label: 'Workflow', width: 200 },
                { id: 'publishedAt', label: 'Published At', width: 200 },
                { id: 'publishedBy', label: 'Published By', width: 160 },
              ],
              rows: [
                {
                  id: 'v2-lead',
                  cells: {
                    version: {
                      type: 'text',
                      value: 'v2',
                      shortLabel: 'V',
                      tone: 'amber',
                    },
                    workflow: { type: 'text', value: 'New Lead Assignment' },
                    publishedAt: {
                      type: 'text',
                      value: 'Oct 15, 2023 9:00 am',
                    },
                    publishedBy: {
                      type: 'person',
                      name: 'Ivan Zhao',
                      shortLabel: 'I',
                      tone: 'gray',
                      kind: 'person',
                      avatarUrl:
                        'https://twentyhq.github.io/placeholder-images/people/image-09.png',
                    },
                  },
                },
                {
                  id: 'v1-lead',
                  cells: {
                    version: {
                      type: 'text',
                      value: 'v1',
                      shortLabel: 'V',
                      tone: 'amber',
                    },
                    workflow: { type: 'text', value: 'New Lead Assignment' },
                    publishedAt: {
                      type: 'text',
                      value: 'Sep 10, 2023 1:00 pm',
                    },
                    publishedBy: {
                      type: 'person',
                      name: 'Ivan Zhao',
                      shortLabel: 'I',
                      tone: 'gray',
                      kind: 'person',
                      avatarUrl:
                        'https://twentyhq.github.io/placeholder-images/people/image-09.png',
                    },
                  },
                },
              ],
            }),
          },
        ],
      },
      {
        id: 'book-demo',
        label: 'Book a demo',
        href: 'https://cal.com/forms/f7841033-0a20-4958-8c92-4e34ec128a81',
        icon: {
          kind: 'brand',
          brand: 'twenty',
          imageSrc: '/images/home/hero/twenty-demo-logo.webp',
          overlay: 'link',
        },
      },
    ],
  },
};
