import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  GRID_POSITIONS,
  TAB_PROPS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const MESSAGE_SEGMENT_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage.tabs
        .home.universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
            .tabs.home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
      members: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
            .tabs.home.widgets.members.universalIdentifier,
        title: 'Members',
        type: WidgetType.FIELD,
        gridPosition: GRID_POSITIONS.FULL_WIDTH,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.messageSegment.fields.members.universalIdentifier,
      },
    },
  },
  tasks: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage.tabs
        .tasks.universalIdentifier,
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
            .tabs.tasks.widgets.tasks.universalIdentifier,
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage.tabs
        .notes.universalIdentifier,
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
            .tabs.notes.widgets.notes.universalIdentifier,
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage.tabs
        .files.universalIdentifier,
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
            .tabs.files.widgets.files.universalIdentifier,
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_SEGMENT_PAGE_LAYOUT_CONFIG = {
  name: 'Default Segment Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.messageSegment.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageSegmentRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_SEGMENT_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
