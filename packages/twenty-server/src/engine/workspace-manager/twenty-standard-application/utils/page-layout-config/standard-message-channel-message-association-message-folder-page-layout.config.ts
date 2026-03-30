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

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab12-4012-8012-a5c4a6121201',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac12-4012-8012-a5c4a6121211',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab12-4012-8012-a5c4a6121202',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac12-4012-8012-a5c4a6121221',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER_PAGE_LAYOUT_CONFIG =
  {
    name: 'Default Message Channel Message Association Message Folder Layout',
    type: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifier:
      STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
        .universalIdentifier,
    universalIdentifier: '20202020-a112-4012-8012-a5c4a6120001',
    defaultTabUniversalIdentifier: null,
    tabs: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER_PAGE_TABS,
  } as const satisfies StandardPageLayoutConfig;
