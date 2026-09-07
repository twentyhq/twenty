import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'twenty-shared/types';
import {
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
  CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  CONDITIONAL_DISPLAY_DEVICE_MOBILE,
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const NOTE_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.home
            .widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
      noteRichText: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.home
            .widgets.noteRichText.universalIdentifier,
        title: WIDGET_PROPS.noteRichText.title,
        type: WIDGET_PROPS.noteRichText.type,
        position: { layoutMode: TAB_PROPS.home.layoutMode, index: 1 },
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
      },
    },
  },
  note: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.note
        .universalIdentifier,
    ...TAB_PROPS.note,
    widgets: {
      noteRichText: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.note
            .widgets.noteRichText.universalIdentifier,
        ...WIDGET_PROPS.noteRichText,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_NOTE_PAGE_LAYOUT_CONFIG = {
  name: 'Default Note Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: NOTE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
