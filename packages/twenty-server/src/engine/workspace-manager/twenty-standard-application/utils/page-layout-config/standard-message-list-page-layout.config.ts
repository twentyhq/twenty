import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType, WidgetType } from 'twenty-shared/types';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import {
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
  CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  CONDITIONAL_DISPLAY_DEVICE_MOBILE,
  TAB_PROPS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const MEMBERS_WIDGET_PROPS = {
  title: 'Members',
  type: WidgetType.FIELD,
  fieldUniversalIdentifier:
    STANDARD_OBJECTS.messageList.fields.members.universalIdentifier,
  fieldDisplayMode: FieldDisplayMode.TABLE,
  embeddedViewUniversalIdentifier:
    STANDARD_OBJECTS.person.views.messageListRecordPageMembers
      .universalIdentifier,
} as const;

// Like the note and task pages, the members table sits under the fields in
// the side panel and on mobile, and gets a tab of its own in full screen.
const MESSAGE_LIST_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
            .home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
      members: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
            .home.widgets.members.universalIdentifier,
        ...MEMBERS_WIDGET_PROPS,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
      },
    },
  },
  members: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
        .members.universalIdentifier,
    ...TAB_PROPS.members,
    widgets: {
      members: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs
            .members.widgets.members.universalIdentifier,
        ...MEMBERS_WIDGET_PROPS,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
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
