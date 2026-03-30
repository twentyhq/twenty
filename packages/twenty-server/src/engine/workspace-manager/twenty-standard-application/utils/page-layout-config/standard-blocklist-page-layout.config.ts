import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

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
    universalIdentifier: '20202020-ab09-4009-8009-b10c115b0901',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac09-4009-8009-b10c115b0911',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab09-4009-8009-b10c115b0902',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac09-4009-8009-b10c115b0921',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_BLOCKLIST_PAGE_LAYOUT_CONFIG = {
  name: 'Default Blocklist Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
  universalIdentifier: '20202020-a109-4009-8009-b10c115b0001',
  defaultTabUniversalIdentifier: null,
  tabs: BLOCKLIST_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
