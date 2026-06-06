import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
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

const TASK_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.home
            .widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
      taskRichText: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.home
            .widgets.taskRichText.universalIdentifier,
        title: WIDGET_PROPS.taskRichText.title,
        type: WIDGET_PROPS.taskRichText.type,
        gridPosition: WIDGET_PROPS.taskRichText.gridPosition,
        position: { layoutMode: TAB_PROPS.home.layoutMode, index: 1 },
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
      },
    },
  },
  note: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.note
        .universalIdentifier,
    ...TAB_PROPS.note,
    widgets: {
      taskRichText: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.note
            .widgets.taskRichText.universalIdentifier,
        ...WIDGET_PROPS.taskRichText,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
      },
    },
  },
  timeline: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.timeline
        .universalIdentifier,
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs
            .timeline.widgets.timeline.universalIdentifier,
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  files: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.files
        .universalIdentifier,
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.files
            .widgets.files.universalIdentifier,
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_TASK_PAGE_LAYOUT_CONFIG = {
  name: 'Default Task Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: TASK_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
