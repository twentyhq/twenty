import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

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
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW),
    title: 'Overview',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS),
    title: 'Details',
    position: 1,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW),
    title: 'Overview',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS),
    title: 'Analytics',
    position: 1,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW),
    title: 'Overview',
    position: 0,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS),
    title: 'Metrics',
    position: 1,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.REVENUE_MAIN),
    title: 'Revenue',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.REVENUE_ANALYTICS,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.MARKETING_MAIN),
    title: 'Marketing',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.MARKETING_METRICS,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.SUPPORT_MAIN),
    title: 'Support',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.SUPPORT_DASHBOARD,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.PRODUCT_MAIN),
    title: 'Product',
    position: 0,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.PRODUCT_USAGE),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.OPERATIONS_MAIN),
    title: 'Operations',
    position: 0,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.OPERATIONS_KPI),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.FINANCE_MAIN),
    title: 'Finance',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.FINANCE_OVERVIEW,
    ),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.EXECUTIVE_MAIN),
    title: 'Executive',
    position: 0,
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.EXECUTIVE_SUMMARY,
    ),
    workspaceId,
  },
];
