import { PAGE_LAYOUT_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type DashboardDataSeed = {
  id: string;
  title: string;
  pageLayoutId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  position: number;
};

export const DASHBOARD_DATA_SEED_COLUMNS: (keyof DashboardDataSeed)[] = [
  'id',
  'title',
  'pageLayoutId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'position',
];

export const DASHBOARD_DATA_SEED_IDS = {
  SALES_OVERVIEW: '20202020-9e82-4342-91ef-c9e70f16a675',
  CUSTOMER_INSIGHTS: '20202020-d64e-4588-98cc-c56ba821247b',
  TEAM_PERFORMANCE: '20202020-b888-4c58-8975-76b4c2035d3a',
  REVENUE_ANALYTICS: '20202020-842e-4cd0-a205-a5bfb1efdb1c',
  MARKETING_METRICS: '20202020-7b87-4522-9fa8-7f97332c4fa7',
  SUPPORT_DASHBOARD: '20202020-5404-49ba-a10a-7941205e577f',
  PRODUCT_USAGE: '20202020-fce2-4c4c-b1dd-6db836141c11',
  OPERATIONS_KPI: '20202020-c1e4-444c-ab36-4fb42d493eb3',
  FINANCE_OVERVIEW: '20202020-b993-4601-945b-996ec668f9e9',
  EXECUTIVE_SUMMARY: '20202020-d2e3-4304-9c80-b3db67903974',
};

export const DASHBOARD_DATA_SEEDS: DashboardDataSeed[] = [
  {
    id: DASHBOARD_DATA_SEED_IDS.SALES_OVERVIEW,
    title: 'Sales Overview',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.SALES_DASHBOARD,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Apple',
    position: 0,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.CUSTOMER_INSIGHTS,
    title: 'Customer Insights',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.CUSTOMER_DASHBOARD,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    createdByName: 'Jony Ive',
    position: 1,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.TEAM_PERFORMANCE,
    title: 'Team Performance',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.TEAM_DASHBOARD,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    createdByName: 'Phil Schiller',
    position: 2,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.REVENUE_ANALYTICS,
    title: 'Revenue Analytics',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.REVENUE_ANALYTICS,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Apple',
    position: 3,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.MARKETING_METRICS,
    title: 'Marketing Metrics',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.MARKETING_METRICS,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    createdByName: 'Jony Ive',
    position: 4,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.SUPPORT_DASHBOARD,
    title: 'Support Dashboard',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.SUPPORT_DASHBOARD,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    createdByName: 'Phil Schiller',
    position: 5,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.PRODUCT_USAGE,
    title: 'Product Usage',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.PRODUCT_USAGE,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Apple',
    position: 6,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.OPERATIONS_KPI,
    title: 'Operations KPI',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.OPERATIONS_KPI,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    createdByName: 'Jony Ive',
    position: 7,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.FINANCE_OVERVIEW,
    title: 'Finance Overview',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.FINANCE_OVERVIEW,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    createdByName: 'Phil Schiller',
    position: 8,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.EXECUTIVE_SUMMARY,
    title: 'Executive Summary',
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.EXECUTIVE_SUMMARY,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Apple',
    position: 9,
  },
];
