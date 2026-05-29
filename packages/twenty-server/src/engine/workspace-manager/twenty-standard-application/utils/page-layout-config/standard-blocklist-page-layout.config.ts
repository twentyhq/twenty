import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const BLOCKLIST_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.blocklistRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.blocklistRecordPage.tabs
            .home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.blocklistRecordPage.tabs
        .timeline.universalIdentifier,
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.blocklistRecordPage.tabs
            .timeline.widgets.timeline.universalIdentifier,
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_BLOCKLIST_PAGE_LAYOUT_CONFIG = {
  name: 'Default Blocklist Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.blocklistRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: BLOCKLIST_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
