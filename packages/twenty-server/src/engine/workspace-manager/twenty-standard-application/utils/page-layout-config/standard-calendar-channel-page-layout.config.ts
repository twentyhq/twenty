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

const CALENDAR_CHANNEL_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab0a-400a-800a-ca1c4a0a0a01',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac0a-400a-800a-ca1c4a0a0a11',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab0a-400a-800a-ca1c4a0a0a02',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac0a-400a-800a-ca1c4a0a0a21',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_CALENDAR_CHANNEL_PAGE_LAYOUT_CONFIG = {
  name: 'Default Calendar Channel Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.calendarChannel.universalIdentifier,
  universalIdentifier: '20202020-a10a-400a-800a-ca1c4a0a0001',
  defaultTabUniversalIdentifier: null,
  tabs: CALENDAR_CHANNEL_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
