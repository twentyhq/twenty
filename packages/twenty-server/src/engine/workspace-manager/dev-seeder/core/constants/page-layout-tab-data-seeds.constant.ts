import { PAGE_LAYOUT_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-data-seeds.constant';

export const PAGE_LAYOUT_TAB_SEED_IDS = {
  SALES_OVERVIEW: '20202020-3fff-4590-8a63-00d861e968ad',
  SALES_DETAILS: '20202020-3db8-449c-aac8-359055276c93',
  CUSTOMER_OVERVIEW: '20202020-95ae-4979-8c32-a48313afaa11',
  CUSTOMER_ANALYTICS: '20202020-4321-43c9-8dc2-d9fb697d39ba',
  TEAM_OVERVIEW: '20202020-e58d-441b-ae1e-6ee8dd157653',
  TEAM_METRICS: '20202020-92f2-4586-bd40-6e021198c8da',
  REVENUE_MAIN: '20202020-a498-4648-836e-a7e89013e115',
  MARKETING_MAIN: '20202020-509b-4dac-a8ec-7255687a6b49',
  SUPPORT_MAIN: '20202020-3c11-49d9-8bc7-a18245604aa2',
  PRODUCT_MAIN: '20202020-6885-44ae-bc21-f450de57a567',
  OPERATIONS_MAIN: '20202020-c4eb-456a-9266-0c44f90e6136',
  FINANCE_MAIN: '20202020-45d2-46d1-ae75-69bc82dea9ef',
  EXECUTIVE_MAIN: '20202020-264b-4801-9656-8bdd73ca7f9a',
};

type PageLayoutTabSeed = {
  id: string;
  title: string;
  position: number;
  pageLayoutId: string;
  workspaceId: string;
};

export const getPageLayoutTabDataSeeds = (
  workspaceId: string,
): PageLayoutTabSeed[] => [
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.SALES_OVERVIEW,
    title: 'Overview',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.SALES_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.SALES_DETAILS,
    title: 'Details',
    position: 1,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.SALES_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.CUSTOMER_OVERVIEW,
    title: 'Overview',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.CUSTOMER_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.CUSTOMER_ANALYTICS,
    title: 'Analytics',
    position: 1,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.CUSTOMER_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.TEAM_OVERVIEW,
    title: 'Overview',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.TEAM_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.TEAM_METRICS,
    title: 'Metrics',
    position: 1,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.TEAM_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.REVENUE_MAIN,
    title: 'Revenue',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.REVENUE_ANALYTICS,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.MARKETING_MAIN,
    title: 'Marketing',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.MARKETING_METRICS,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.SUPPORT_MAIN,
    title: 'Support',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.SUPPORT_DASHBOARD,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.PRODUCT_MAIN,
    title: 'Product',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.PRODUCT_USAGE,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.OPERATIONS_MAIN,
    title: 'Operations',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.OPERATIONS_KPI,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.FINANCE_MAIN,
    title: 'Finance',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.FINANCE_OVERVIEW,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_TAB_SEED_IDS.EXECUTIVE_MAIN,
    title: 'Executive',
    position: 0,
    pageLayoutId: PAGE_LAYOUT_SEED_IDS.EXECUTIVE_SUMMARY,
    workspaceId,
  },
];
