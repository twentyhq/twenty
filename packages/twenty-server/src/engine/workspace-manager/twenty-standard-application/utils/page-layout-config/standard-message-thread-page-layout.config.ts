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

const MESSAGE_THREAD_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-f639-48a0-9a44-027cf4e3cd15',
    ...TAB_PROPS.home,
    widgets: {
      emailThread: {
        universalIdentifier: '20202020-d57e-44cb-b220-69a881feb9c3',
        ...WIDGET_PROPS.emailThread,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_THREAD_PAGE_LAYOUT_CONFIG = {
  name: 'Default Message Thread Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
  universalIdentifier: '20202020-95bb-40eb-a699-70e7ea02a79e',
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_THREAD_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
