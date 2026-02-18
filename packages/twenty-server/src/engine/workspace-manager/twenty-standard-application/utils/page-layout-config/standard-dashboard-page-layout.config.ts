import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const DASHBOARD_PAGE_TABS = {
  tab1: {
    universalIdentifier: '20202020-d011-4d11-8d11-da5ab0a01001',
    title: 'Tab 1',
    position: 0,
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    widgets: {
      welcomeRichText: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11001',
      },
      dealsByCompany: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11002',
      },
      pipelineValueByStage: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11003',
      },
      revenueTimeline: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11004',
      },
      opportunitiesByOwner: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11005',
      },
      stockMarketIframe: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11006',
      },
      dealsCreatedThisMonth: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11007',
      },
      dealValueCreatedThisMonth: {
        universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11008',
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG = {
  name: 'My First Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectUniversalIdentifier: null,
  universalIdentifier: '20202020-d001-4d01-8d01-da5ab0a00001',
  defaultTabUniversalIdentifier: null,
  tabs: DASHBOARD_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
