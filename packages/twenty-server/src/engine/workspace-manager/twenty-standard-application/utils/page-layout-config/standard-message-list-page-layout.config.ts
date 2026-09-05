import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  type PageLayoutWidgetGridPosition,
  WidgetType,
} from 'twenty-shared/types';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

export const MESSAGE_LIST_GRID_LAYOUT_POSITIONS = {
  LEFT_COLUMN: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 12,
    columnSpan: 6,
  },
  RIGHT_COLUMN: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 6,
    rowSpan: 12,
    columnSpan: 6,
  },
} as const satisfies Record<string, PageLayoutWidgetGridPosition>;

const MESSAGE_LIST_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
            .home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
        position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.LEFT_COLUMN,
      },
      members: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
            .home.widgets.members.universalIdentifier,
        title: 'Members',
        type: WidgetType.FIELD,
        position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.RIGHT_COLUMN,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.messageList.fields.members.universalIdentifier,
        fieldDisplayMode: FieldDisplayMode.TABLE,
        embeddedViewUniversalIdentifier:
          STANDARD_OBJECTS.person.views.messageListRecordPageMembers
            .universalIdentifier,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_LIST_PAGE_LAYOUT_CONFIG = {
  name: 'Default List Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.messageList.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_LIST_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
