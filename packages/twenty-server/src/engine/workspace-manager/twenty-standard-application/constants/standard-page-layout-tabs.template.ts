import { msg } from '@lingui/core/macro';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetVerticalListPosition,
  WidgetType,
} from 'twenty-shared/types';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const CONDITIONAL_DISPLAY_DEVICE_MOBILE = {
  and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
} as const satisfies PageLayoutWidgetConditionalDisplay;

export const CONDITIONAL_DISPLAY_DEVICE_DESKTOP = {
  and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
} as const satisfies PageLayoutWidgetConditionalDisplay;

export const CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE =
  'device == "MOBILE"';

export const CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP =
  'device == "DESKTOP"';

export const GRID_LAYOUT_POSITIONS = {
  FULL_WIDTH: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 12,
    columnSpan: 12,
  },
  HALF_HEIGHT: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 6,
    columnSpan: 12,
  },
  RICH_TEXT: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 12,
    column: 0,
    rowSpan: 6,
    columnSpan: 12,
  },
} as const satisfies Record<string, PageLayoutWidgetGridPosition>;

export const VERTICAL_LIST_LAYOUT_POSITIONS = {
  FIRST: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 0,
  },
  SECOND: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 1,
  },
  THIRD: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 2,
  },
  FOURTH: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 3,
  },
  FIFTH: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 4,
  },
} as const satisfies Record<string, PageLayoutWidgetVerticalListPosition>;

export const TAB_PROPS = {
  home: {
    title: i18nLabel(msg({ message: `Home`, context: 'pageLayoutTab.title' })),
    position: 10,
    icon: 'IconHome',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  timeline: {
    title: i18nLabel(
      msg({ message: `Timeline`, context: 'pageLayoutTab.title' }),
    ),
    position: 20,
    icon: 'IconTimelineEvent',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  tasks: {
    title: i18nLabel(msg({ message: `Tasks`, context: 'pageLayoutTab.title' })),
    position: 30,
    icon: 'IconCheckbox',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  notes: {
    title: i18nLabel(msg({ message: `Notes`, context: 'pageLayoutTab.title' })),
    position: 40,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  files: {
    title: i18nLabel(msg({ message: `Files`, context: 'pageLayoutTab.title' })),
    position: 50,
    icon: 'IconFiles',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  emails: {
    title: i18nLabel(
      msg({ message: `Emails`, context: 'pageLayoutTab.title' }),
    ),
    position: 60,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  conversations: {
    title: i18nLabel(
      msg({ message: `Conversations`, context: 'pageLayoutTab.title' }),
    ),
    position: 65,
    icon: 'IconMessage',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  chat: {
    title: i18nLabel(msg({ message: `Chat`, context: 'pageLayoutTab.title' })),
    position: 10,
    icon: 'IconMessage',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  calendar: {
    title: i18nLabel(
      msg({ message: `Calendar`, context: 'pageLayoutTab.title' }),
    ),
    position: 70,
    icon: 'IconCalendarEvent',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  note: {
    title: i18nLabel(msg({ message: `Note`, context: 'pageLayoutTab.title' })),
    position: 15,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  members: {
    title: i18nLabel(
      msg({ message: `Members`, context: 'pageLayoutTab.title' }),
    ),
    position: 15,
    icon: 'IconUsers',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  flow: {
    title: i18nLabel(msg({ message: `Flow`, context: 'pageLayoutTab.title' })),
    position: 10,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  composer: {
    title: i18nLabel(msg({ message: `Email`, context: 'pageLayoutTab.title' })),
    position: 15,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  flowSecondary: {
    title: i18nLabel(msg({ message: `Flow`, context: 'pageLayoutTab.title' })),
    position: 20,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
} as const;

export const WIDGET_PROPS = {
  fields: {
    title: i18nLabel(
      msg({ message: `Fields`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.FIELDS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  timeline: {
    title: i18nLabel(
      msg({ message: `Timeline`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.TIMELINE,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  tasks: {
    title: i18nLabel(
      msg({ message: `Tasks`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.TASKS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  notes: {
    title: i18nLabel(
      msg({ message: `Notes`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.NOTES,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  files: {
    title: i18nLabel(
      msg({ message: `Files`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.FILES,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  emails: {
    title: i18nLabel(
      msg({ message: `Emails`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.EMAILS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  conversations: {
    title: i18nLabel(
      msg({ message: `Conversations`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.CHAT_THREADS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
    conditionalAvailabilityExpression: 'featureFlags.IS_AI_CHAT_INBOX_ENABLED',
  },
  calendar: {
    title: i18nLabel(
      msg({ message: `Calendar`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.CALENDAR,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  noteRichText: {
    title: i18nLabel(
      msg({ message: `Note`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.FIELD_RICH_TEXT,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  taskRichText: {
    title: i18nLabel(
      msg({ message: `Task`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.FIELD_RICH_TEXT,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflow: {
    title: i18nLabel(
      msg({ message: `Flow`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.WORKFLOW,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  messageCampaign: {
    title: i18nLabel(
      msg({ message: `Email`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.MESSAGE_CAMPAIGN_BODY,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflowVersion: {
    title: i18nLabel(
      msg({ message: `Flow`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.WORKFLOW_VERSION,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflowRun: {
    title: i18nLabel(
      msg({ message: `Flow`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.WORKFLOW_RUN,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  chat: {
    title: i18nLabel(
      msg({ message: `Chat`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.CHAT,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  emailThread: {
    title: i18nLabel(
      msg({ message: `Thread`, context: 'pageLayoutWidget.title' }),
    ),
    type: WidgetType.EMAIL_THREAD,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
  },
} as const;
