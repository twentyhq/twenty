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
    title: 'Team & People',
    position: 0,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS),
    title: 'Tasks & Activity',
    position: 1,
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    workspaceId,
  },
];
