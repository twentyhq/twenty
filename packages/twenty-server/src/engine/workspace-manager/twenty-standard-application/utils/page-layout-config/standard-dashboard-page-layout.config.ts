import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const DASHBOARD_PAGE_TABS = {
  tab1: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
        .universalIdentifier,
    title: 'Tab 1',
    position: 0,
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    widgets: {
      welcomeRichText: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.welcomeRichText.universalIdentifier,
      },
      dealsByCompany: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.dealsByCompany.universalIdentifier,
      },
      pipelineValueByStage: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.pipelineValueByStage.universalIdentifier,
      },
      revenueTimeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.revenueTimeline.universalIdentifier,
      },
      opportunitiesByOwner: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.opportunitiesByOwner.universalIdentifier,
      },
      stockMarketIframe: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.stockMarketIframe.universalIdentifier,
      },
      dealsCreatedThisMonth: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.dealsCreatedThisMonth.universalIdentifier,
      },
      dealValueCreatedThisMonth: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
            .widgets.dealValueCreatedThisMonth.universalIdentifier,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG = {
  name: 'My First Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectUniversalIdentifier: null,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: DASHBOARD_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
