import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

export const getPageLayoutTabFlatEntitySeeds = ({
  workspaceId,
  flatApplication,
}: {
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatPageLayoutTab[] => {
  const now = new Date().toISOString();

  const buildTab = (
    tabSeed: string,
    title: string,
    position: number,
    pageLayoutSeed: string,
  ): FlatPageLayoutTab => ({
    id: generateSeedId(workspaceId, tabSeed),
    universalIdentifier: generateSeedId(workspaceId, tabSeed),
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    workspaceId,
    title,
    position,
    pageLayoutId: generateSeedId(workspaceId, pageLayoutSeed),
    pageLayoutUniversalIdentifier: generateSeedId(workspaceId, pageLayoutSeed),
    widgetIds: [],
    widgetUniversalIdentifiers: [],
    isActive: true,
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    overrides: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  return [
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
      'Overview',
      0,
      PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS,
      'Details',
      1,
      PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      'Overview',
      0,
      PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
      'Analytics',
      1,
      PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
      'Team & People',
      0,
      PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
      'Tasks & Activity',
      1,
      PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD,
    ),
    buildTab(
      PAGE_LAYOUT_TAB_SEEDS.DOCUMENTATION,
      'Documentation',
      0,
      PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
    ),
  ];
};
