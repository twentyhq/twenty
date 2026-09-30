import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'twenty-shared/types';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const AGENT_CHAT_THREAD_PAGE_TABS = {
  chat: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage.tabs
        .chat.universalIdentifier,
    ...TAB_PROPS.chat,
    widgets: {
      chat: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage
            .tabs.chat.widgets.chat.universalIdentifier,
        ...WIDGET_PROPS.chat,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_AGENT_CHAT_THREAD_PAGE_LAYOUT_CONFIG = {
  name: 'Default Chat Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier:
    AGENT_CHAT_THREAD_PAGE_TABS.chat.universalIdentifier,
  tabs: AGENT_CHAT_THREAD_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
