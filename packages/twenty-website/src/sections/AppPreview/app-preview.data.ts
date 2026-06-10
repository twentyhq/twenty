import type {
  AppPreviewConfig,
  DashboardData,
  DashboardPageDefinition,
  KanbanPageDefinition,
  TablePageDefinition,
} from './types';
import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

const PEOPLE_AVATAR_URLS = SHARED_PEOPLE_AVATAR_URLS;

const SALES_DASHBOARD_DATA: DashboardData = {
  kpis: [
    {
      id: 'pipeline',
      title: 'Pipeline',
      value: '$12.9M',
      trend: { direction: 'up', value: '+8%' },
    },
    {
      id: 'won-this-quarter',
      title: 'Won this quarter',
      value: '$2.4M',
      trend: { direction: 'up', value: '+12%' },
    },
    {
      id: 'win-rate',
      title: 'Win rate',
      value: '38%',
      trend: { direction: 'down', value: '-3%' },
    },
  ],
  lineChart: {
    title: 'ARR over time',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    values: [3.1, 3.8, 3.5, 4.6, 5.4, 6.1, 7.2],
  },
  barChart: {
    title: 'Deals by stage',
    bars: [
      { label: 'New', value: 12 },
      { label: 'Screening', value: 9 },
      { label: 'Meeting', value: 7 },
      { label: 'Proposal', value: 5 },
      { label: 'Customer', value: 4 },
    ],
  },
  donutChart: {
    title: 'By industry',
    centerValue: '24',
    centerLabel: 'deals',
    slices: [
      { label: 'AI', value: 8, color: '#8da4ef' },
      { label: 'Fintech', value: 6, color: '#be93e4' },
      { label: 'SaaS', value: 5, color: '#53b9ab' },
      { label: 'Other', value: 5, color: '#ec9455' },
    ],
  },
};

const SALES_DASHBOARD_PAGE: DashboardPageDefinition = {
  type: 'dashboard',
  header: {
    title: 'Sales Dashboard',
  },
  dashboard: SALES_DASHBOARD_DATA,
};

const OPPORTUNITY_KANBAN_PAGE: KanbanPageDefinition = {
  type: 'kanban',
  header: {
    title: 'Best leads',
  },
  lanes: [
    {
      id: 'new',
      label: 'New',
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
            name: 'Dario Amodei',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
          },
          rating: 2,
          date: 'Jul 1, 2023',
          mainContact: {
            type: 'person',
            name: 'Dario Amodei',
            shortLabel: 'D',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
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
            name: 'Dylan Field',
            tone: 'purple',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
          },
          rating: 2,
          date: 'Jul 12, 2023',
          mainContact: {
            type: 'person',
            name: 'Dylan Field',
            shortLabel: 'D',
            tone: 'purple',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
          },
          recordId: 'OPP-2',
        },
      ],
    },
    {
      id: 'screening',
      label: 'Screening',
      tone: 'purple',
      cards: [
        {
          id: 'notion-workspace-consolidation',
          title: 'Workspace Consolidation',
          amount: '$750,000',
          company: { type: 'entity', name: 'Notion', domain: 'notion.com' },
          accountOwner: {
            type: 'person',
            name: 'Ivan Zhao',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
          },
          rating: 4,
          date: 'Jul 8, 2023',
          mainContact: {
            type: 'person',
            name: 'Ivan Zhao',
            shortLabel: 'I',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
          },
          recordId: 'OPP-3',
        },
      ],
    },
    {
      id: 'meeting',
      label: 'Meeting',
      tone: 'blue',
      cards: [
        {
          id: 'github-copilot-rollout',
          title: 'Copilot Rollout',
          amount: '$900,000',
          company: { type: 'entity', name: 'Github', domain: 'github.com' },
          accountOwner: {
            type: 'person',
            name: 'Chris Wanstrath',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.chrisWanstrath,
          },
          rating: 3,
          date: 'Jul 14, 2023',
          mainContact: {
            type: 'person',
            name: 'Thomas Dohmke',
            shortLabel: 'T',
            tone: 'gray',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.thomasDohmke,
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
            name: 'Patrick Collison',
            tone: 'blue',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
          },
          rating: 5,
          date: 'Jul 17, 2023',
          mainContact: {
            type: 'person',
            name: 'Patrick Collison',
            shortLabel: 'P',
            tone: 'blue',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
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
            name: 'Joe Gebbia',
            tone: 'pink',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.joeGebbia,
          },
          rating: 3,
          date: 'Jul 15, 2023',
          mainContact: {
            type: 'person',
            name: 'Brian Chesky',
            shortLabel: 'B',
            tone: 'pink',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.brianChesky,
          },
          recordId: 'OPP-6',
        },
      ],
    },
    {
      id: 'proposal',
      label: 'Proposal',
      tone: 'gray',
      cards: [],
    },
    {
      id: 'customer',
      label: 'Customer',
      tone: 'green',
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
            name: 'Ben Chestnut',
            tone: 'amber',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.benChestnut,
          },
          rating: 4,
          date: 'Jul 23, 2023',
          mainContact: {
            type: 'person',
            name: 'Rania Succar',
            shortLabel: 'R',
            tone: 'amber',
            kind: 'person',
            avatarUrl: PEOPLE_AVATAR_URLS.anonymousLaura,
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
  columns: TablePageDefinition['columns'];
  rows: TablePageDefinition['rows'];
}): TablePageDefinition {
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

export const APP_PREVIEW_DATA: { visual: AppPreviewConfig } = {
  visual: {
    defaultViewbarActions: ['Filter', 'Sort', 'Options'],
    sidebar: {
      favorites: [
        {
          id: 'sales-dashboard',
          label: 'Sales Dashboard',
          icon: { kind: 'avatar', label: 'S', tone: 'amber', shape: 'circle' },
          meta: 'Dashboard',
          page: SALES_DASHBOARD_PAGE,
        },
      ],
      initialActiveItemId: 'companies',
      initialOpenFolderIds: [],
      workspace: [
        {
          id: 'companies',
          label: 'Companies',
          icon: { kind: 'tabler', name: 'buildingSkyscraper', tone: 'blue' },
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
              {
                id: 'employees',
                label: 'Employees',
                width: 120,
                align: 'right',
              },
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
                  url: { type: 'link', kind: 'url', value: 'anthropic.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Dario Amodei',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
                  },
                  address: { type: 'text', value: '18 Rue De Navarin' },
                  accountOwner: {
                    type: 'person',
                    name: 'Dario Amodei',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$500,000' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'anthropic',
                  },
                  industry: { type: 'select', value: 'AI Research' },
                  mainContact: {
                    type: 'person',
                    name: 'Dario Amodei',
                    shortLabel: 'D',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
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
                  url: { type: 'link', kind: 'url', value: 'linkedin.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Reid Hoffman',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.reidHoffman,
                  },
                  address: { type: 'text', value: '1226 Moises Causeway' },
                  accountOwner: {
                    type: 'person',
                    name: 'Ryan Roslansky',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ryanRoslansky,
                  },
                  icp: { type: 'boolean', value: false },
                  arr: { type: 'currency', value: '$1,000,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'linkedin' },
                  industry: {
                    type: 'select',
                    value: 'Professional Networking',
                  },
                  mainContact: {
                    type: 'person',
                    name: 'Ryan Roslansky',
                    shortLabel: 'R',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ryanRoslansky,
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
                  company: {
                    type: 'entity',
                    name: 'Slack',
                    domain: 'slack.com',
                  },
                  url: { type: 'link', kind: 'url', value: 'slack.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Stewart Butterfield',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
                  },
                  address: { type: 'text', value: '1316 Dameon Mountain' },
                  accountOwner: {
                    type: 'person',
                    name: 'Stewart Butterfield',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$2,300,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'slack' },
                  industry: { type: 'select', value: 'Collaboration Software' },
                  mainContact: {
                    type: 'person',
                    name: 'Lidiane Jones',
                    shortLabel: 'LJ',
                    tone: 'pink',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.anonymousIndira,
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
                  url: { type: 'link', kind: 'url', value: 'notion.com' },
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
                    name: 'Ivan Zhao',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
                  },
                  icp: { type: 'boolean', value: false },
                  arr: { type: 'currency', value: '$750,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'notion' },
                  industry: { type: 'select', value: 'Productivity Software' },
                  mainContact: {
                    type: 'person',
                    name: 'Ivan Zhao',
                    shortLabel: 'I',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
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
                  company: {
                    type: 'entity',
                    name: 'Figma',
                    domain: 'figma.com',
                  },
                  url: { type: 'link', kind: 'url', value: 'figma.com' },
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
                    name: 'Dylan Field',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$3,500,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'figma' },
                  industry: { type: 'select', value: 'Design Tools' },
                  mainContact: {
                    type: 'person',
                    name: 'Dylan Field',
                    shortLabel: 'D',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
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
                  url: { type: 'link', kind: 'url', value: 'github.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Chris Wanstrath',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.chrisWanstrath,
                  },
                  address: { type: 'text', value: '3891 Ranchview Drive' },
                  accountOwner: {
                    type: 'person',
                    name: 'Thomas Dohmke',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.thomasDohmke,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$900,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'github' },
                  industry: { type: 'select', value: 'Developer Platform' },
                  mainContact: {
                    type: 'person',
                    name: 'Thomas Dohmke',
                    shortLabel: 'T',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.thomasDohmke,
                  },
                  employees: { type: 'number', value: '3,800' },
                  opportunities: {
                    type: 'relation',
                    items: [
                      {
                        name: 'Copilot Rollout',
                        shortLabel: 'C',
                        tone: 'blue',
                      },
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
                  url: { type: 'link', kind: 'url', value: 'airbnb.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Joe Gebbia',
                    tone: 'pink',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.joeGebbia,
                  },
                  address: { type: 'text', value: '4517 Washington Avenue' },
                  accountOwner: {
                    type: 'person',
                    name: 'Brian Chesky',
                    tone: 'pink',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.brianChesky,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$4,200,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'airbnb' },
                  industry: { type: 'select', value: 'Travel' },
                  mainContact: {
                    type: 'person',
                    name: 'Brian Chesky',
                    shortLabel: 'B',
                    tone: 'pink',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.brianChesky,
                  },
                  employees: { type: 'number', value: '6,900' },
                  opportunities: {
                    type: 'relation',
                    items: [
                      { name: 'Host Ops', shortLabel: 'H', tone: 'pink' },
                    ],
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
                  url: { type: 'link', kind: 'url', value: 'stripe.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Patrick Collison',
                    tone: 'blue',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
                  },
                  address: { type: 'text', value: '2118 Thornridge Circle' },
                  accountOwner: {
                    type: 'person',
                    name: 'Patrick Collison',
                    tone: 'blue',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$1,800,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'stripe' },
                  industry: { type: 'select', value: 'Payments' },
                  mainContact: {
                    type: 'person',
                    name: 'Patrick Collison',
                    shortLabel: 'P',
                    tone: 'blue',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
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
                  url: { type: 'link', kind: 'url', value: 'sequoia.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Roelof Botha',
                    tone: 'green',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.roelofBotha,
                  },
                  address: { type: 'text', value: '1316 Dameon Mountain' },
                  accountOwner: {
                    type: 'person',
                    name: 'Roelof Botha',
                    tone: 'green',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.roelofBotha,
                  },
                  icp: { type: 'boolean', value: false },
                  arr: { type: 'currency', value: '$6,000,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'sequoia' },
                  industry: { type: 'select', value: 'Venture Capital' },
                  mainContact: {
                    type: 'person',
                    name: 'Roelof Botha',
                    shortLabel: 'R',
                    tone: 'green',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.roelofBotha,
                  },
                  employees: { type: 'number', value: '1,100' },
                  opportunities: {
                    type: 'relation',
                    items: [
                      { name: 'Fund Ops', shortLabel: 'F', tone: 'green' },
                    ],
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
                  url: { type: 'link', kind: 'url', value: 'segment.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Peter Reinhardt',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.peterReinhardt,
                  },
                  address: { type: 'text', value: '8502 Preston Rd. East' },
                  accountOwner: {
                    type: 'person',
                    name: 'Peter Reinhardt',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.peterReinhardt,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$2,750,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'segment' },
                  industry: { type: 'select', value: 'Customer Data' },
                  mainContact: {
                    type: 'person',
                    name: 'Peter Reinhardt',
                    shortLabel: 'P',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.peterReinhardt,
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
                  url: { type: 'link', kind: 'url', value: 'mailchimp.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Ben Chestnut',
                    tone: 'amber',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.benChestnut,
                  },
                  address: { type: 'text', value: '3517 W. Gray St.' },
                  accountOwner: {
                    type: 'person',
                    name: 'Ben Chestnut',
                    tone: 'amber',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.benChestnut,
                  },
                  icp: { type: 'boolean', value: false },
                  arr: { type: 'currency', value: '$1,250,000' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'mailchimp',
                  },
                  industry: { type: 'select', value: 'Marketing Automation' },
                  mainContact: {
                    type: 'person',
                    name: 'Rania Succar',
                    shortLabel: 'R',
                    tone: 'amber',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.anonymousLaura,
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
                  company: {
                    type: 'entity',
                    name: 'Accel',
                    domain: 'accel.com',
                  },
                  url: { type: 'link', kind: 'url', value: 'accel.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Ray Damm',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.rayDamm,
                  },
                  address: { type: 'text', value: '4140 Parker Rd.' },
                  accountOwner: {
                    type: 'person',
                    name: 'Ping Li',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.pingLi,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$5,800,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'accel' },
                  industry: { type: 'select', value: 'Venture Capital' },
                  mainContact: {
                    type: 'person',
                    name: 'Ping Li',
                    shortLabel: 'P',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.pingLi,
                  },
                  employees: { type: 'number', value: '540' },
                  opportunities: {
                    type: 'relation',
                    items: [
                      {
                        name: 'Portfolio Sync',
                        shortLabel: 'P',
                        tone: 'purple',
                      },
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
                  url: { type: 'link', kind: 'url', value: 'foundersfund.com' },
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
                    name: 'Peter Thiel',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.peterThiel,
                  },
                  icp: { type: 'boolean', value: true },
                  arr: { type: 'currency', value: '$2,100,000' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'foundersfund',
                  },
                  industry: { type: 'select', value: 'Private Equity' },
                  mainContact: {
                    type: 'person',
                    name: 'Peter Thiel',
                    shortLabel: 'P',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.peterThiel,
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
                  url: { type: 'link', kind: 'url', value: 'google.com' },
                  createdBy: {
                    type: 'person',
                    name: 'Sundar Pichai',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.sundarPichai,
                  },
                  address: { type: 'text', value: '4140 Parker Rd.' },
                  accountOwner: {
                    type: 'person',
                    name: 'Sundar Pichai',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.sundarPichai,
                  },
                  icp: { type: 'boolean', value: false },
                  arr: { type: 'currency', value: '$7,500,000' },
                  linkedin: { type: 'link', kind: 'social', value: 'google' },
                  industry: { type: 'select', value: 'Computer Software' },
                  mainContact: {
                    type: 'person',
                    name: 'Sundar Pichai',
                    shortLabel: 'S',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.sundarPichai,
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
                id: 'dario-amodei',
                cells: {
                  name: {
                    type: 'person',
                    name: 'Dario Amodei',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
                  },
                  company: {
                    type: 'entity',
                    name: 'Anthropic',
                    domain: 'anthropic.com',
                  },
                  email: {
                    type: 'link',
                    kind: 'email',
                    value: 'dario@anthropic.com',
                  },
                  phone: {
                    type: 'link',
                    kind: 'phone',
                    value: '+1 415 555 0101',
                  },
                  jobTitle: { type: 'text', value: 'CEO' },
                  city: { type: 'text', value: 'San Francisco' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'dario-amodei',
                  },
                  added: { type: 'text', value: 'Jul 3, 2023' },
                },
              },
              {
                id: 'ryan-roslansky',
                cells: {
                  name: {
                    type: 'person',
                    name: 'Ryan Roslansky',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ryanRoslansky,
                  },
                  company: {
                    type: 'entity',
                    name: 'Linkedin',
                    domain: 'linkedin.com',
                  },
                  email: {
                    type: 'link',
                    kind: 'email',
                    value: 'ryan@linkedin.com',
                  },
                  phone: {
                    type: 'link',
                    kind: 'phone',
                    value: '+1 650 555 0134',
                  },
                  jobTitle: { type: 'text', value: 'CEO' },
                  city: { type: 'text', value: 'Sunnyvale' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'ryanroslansky',
                  },
                  added: { type: 'text', value: 'Jul 28, 2023' },
                },
              },
              {
                id: 'stewart-butterfield',
                cells: {
                  name: {
                    type: 'person',
                    name: 'Stewart Butterfield',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
                  },
                  company: {
                    type: 'entity',
                    name: 'Slack',
                    domain: 'slack.com',
                  },
                  email: {
                    type: 'link',
                    kind: 'email',
                    value: 'stewart@slack.com',
                  },
                  phone: {
                    type: 'link',
                    kind: 'phone',
                    value: '+1 415 555 0142',
                  },
                  jobTitle: { type: 'text', value: 'Co-founder' },
                  city: { type: 'text', value: 'San Francisco' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'stewart-butterfield',
                  },
                  added: { type: 'text', value: 'Jul 18, 2023' },
                },
              },
              {
                id: 'ivan-zhao',
                cells: {
                  name: {
                    type: 'person',
                    name: 'Ivan Zhao',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
                  },
                  company: {
                    type: 'entity',
                    name: 'Notion',
                    domain: 'notion.com',
                  },
                  email: {
                    type: 'link',
                    kind: 'email',
                    value: 'ivan@notion.com',
                  },
                  phone: {
                    type: 'link',
                    kind: 'phone',
                    value: '+1 628 555 0186',
                  },
                  jobTitle: { type: 'text', value: 'CEO' },
                  city: { type: 'text', value: 'San Francisco' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'ivanhzhao',
                  },
                  added: { type: 'text', value: 'Jul 8, 2023' },
                },
              },
              {
                id: 'dylan-field',
                cells: {
                  name: {
                    type: 'person',
                    name: 'Dylan Field',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
                  },
                  company: {
                    type: 'entity',
                    name: 'Figma',
                    domain: 'figma.com',
                  },
                  email: {
                    type: 'link',
                    kind: 'email',
                    value: 'dylan@figma.com',
                  },
                  phone: {
                    type: 'link',
                    kind: 'phone',
                    value: '+1 415 555 0128',
                  },
                  jobTitle: { type: 'text', value: 'CEO' },
                  city: { type: 'text', value: 'San Francisco' },
                  linkedin: {
                    type: 'link',
                    kind: 'social',
                    value: 'dylanfield',
                  },
                  added: { type: 'text', value: 'Jul 12, 2023' },
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
                    name: 'Dario Amodei',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
                  },
                  dueDate: { type: 'text', value: 'Oct 25, 2023' },
                  relatedTo: {
                    type: 'entity',
                    name: 'Anthropic',
                    domain: 'anthropic.com',
                  },
                  status: { type: 'select', value: 'To Do' },
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
                    name: 'Stewart Butterfield',
                    tone: 'teal',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
                  },
                  dueDate: { type: 'text', value: 'Oct 28, 2023' },
                  relatedTo: {
                    type: 'entity',
                    name: 'Slack',
                    domain: 'slack.com',
                  },
                  status: {
                    type: 'select',
                    color: 'blue',
                    value: 'In Progress',
                  },
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
                    name: 'Ivan Zhao',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
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
                    name: 'Dylan Field',
                    tone: 'purple',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
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
                    tone: 'amber',
                  },
                  createdBy: {
                    type: 'person',
                    name: 'Dario Amodei',
                    tone: 'gray',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
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
                    name: 'Patrick Collison',
                    tone: 'blue',
                    kind: 'person',
                    avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
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
              id: 'workflow-send-email-sequence',
              hidden: true,
              label: 'Send email sequence when deal is engaged',
              icon: {
                color: '#451E11',
                kind: 'avatar',
                label: 'S',
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
                  title: 'Send email sequence when deal is engaged',
                },
                nodes: [
                  {
                    id: 'trigger',
                    x: 415,
                    y: 60,
                    width: 200,
                    label: 'Trigger',
                    title: 'Manual trigger',
                    iconName: 'plug',
                  },
                  {
                    id: 'iterator',
                    x: 420,
                    y: 195,
                    width: 190,
                    label: 'Action',
                    title: 'Iterator',
                    iconName: 'repeat',
                  },
                  {
                    id: 'send-email',
                    x: 640,
                    y: 268,
                    width: 200,
                    label: 'Action',
                    title: 'Send Email',
                    iconName: 'mail',
                  },
                ],
                edges: [
                  { from: 'trigger', to: 'iterator', type: 'vertical' },
                  {
                    from: 'iterator',
                    to: 'send-email',
                    type: 'loopRight',
                  },
                  {
                    from: 'send-email',
                    to: 'trigger',
                    type: 'loopBack',
                  },
                ],
                branchLabels: [
                  { x: 656, y: 214, text: 'loop' },
                  { x: 515, y: 276, text: 'completed' },
                ],
                plusNode: { x: 515, y: 308 },
              },
            },
            {
              id: 'workflow-list',
              label: 'All Workflows',
              icon: {
                kind: 'tabler',
                name: 'settingsAutomation',
                tone: 'gray',
              },
              page: createTablePage({
                title: 'All Workflows',
                count: 2,
                columns: [
                  {
                    id: 'name',
                    label: 'Name',
                    width: 240,
                    isFirstColumn: true,
                  },
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
                        tone: 'orange',
                      },
                      status: {
                        type: 'select',
                        color: 'green',
                        value: 'Active',
                      },
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
                      status: { type: 'select', value: 'Inactive' },
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
                      status: {
                        type: 'select',
                        color: 'green',
                        value: 'Success',
                      },
                      startedAt: {
                        type: 'text',
                        value: 'Oct 24, 2023 10:00 am',
                      },
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
                      status: { type: 'select', color: 'red', value: 'Failed' },
                      startedAt: {
                        type: 'text',
                        value: 'Oct 20, 2023 3:15 pm',
                      },
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
                        avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
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
                        avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
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
  },
};
