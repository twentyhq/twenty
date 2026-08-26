import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';

import {
  TAB_PROPS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const CALL_RECORDING_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
        .home.universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
            .tabs.home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
        .timeline.universalIdentifier,
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
            .tabs.timeline.widgets.timeline.universalIdentifier,
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  summary: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
        .summary.universalIdentifier,
    title: 'Summary',
    position: 30,
    icon: 'IconFileText',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    widgets: {
      summary: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
            .tabs.summary.widgets.summary.universalIdentifier,
        title: 'Summary',
        type: WidgetType.CALL_RECORDING_SUMMARY,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
      },
    },
  },
  callRecording: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
        .callRecording.universalIdentifier,
    title: 'Call Recording',
    position: 40,
    icon: 'IconVideo',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    widgets: {
      transcript: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
            .tabs.callRecording.widgets.transcript.universalIdentifier,
        title: 'Transcript',
        type: WidgetType.CALL_RECORDING_TRANSCRIPT,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_CALL_RECORDING_PAGE_LAYOUT_CONFIG = {
  name: 'Default Call Recording Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: CALL_RECORDING_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
