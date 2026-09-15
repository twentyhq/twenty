import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetVerticalListPosition,
  WidgetType,
} from 'twenty-shared/types';

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
    title: 'Home',
    position: 10,
    icon: 'IconHome',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  timeline: {
    title: 'Timeline',
    position: 20,
    icon: 'IconTimelineEvent',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  tasks: {
    title: 'Tasks',
    position: 30,
    icon: 'IconCheckbox',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  notes: {
    title: 'Notes',
    position: 40,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  files: {
    title: 'Files',
    position: 50,
    icon: 'IconFiles',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  emails: {
    title: 'Emails',
    position: 60,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  calendar: {
    title: 'Calendar',
    position: 70,
    icon: 'IconCalendarEvent',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  note: {
    title: 'Note',
    position: 15,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  members: {
    title: 'Members',
    position: 15,
    icon: 'IconUsers',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  flow: {
    title: 'Flow',
    position: 10,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  composer: {
    title: 'Email',
    position: 15,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  flowSecondary: {
    title: 'Flow',
    position: 20,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
} as const;

export const WIDGET_PROPS = {
  fields: {
    title: 'Fields',
    type: WidgetType.FIELDS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  timeline: {
    title: 'Timeline',
    type: WidgetType.TIMELINE,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  tasks: {
    title: 'Tasks',
    type: WidgetType.TASKS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  notes: {
    title: 'Notes',
    type: WidgetType.NOTES,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  files: {
    title: 'Files',
    type: WidgetType.FILES,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  emails: {
    title: 'Emails',
    type: WidgetType.EMAILS,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  calendar: {
    title: 'Calendar',
    type: WidgetType.CALENDAR,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  noteRichText: {
    title: 'Note',
    type: WidgetType.FIELD_RICH_TEXT,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  taskRichText: {
    title: 'Task',
    type: WidgetType.FIELD_RICH_TEXT,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflow: {
    title: 'Flow',
    type: WidgetType.WORKFLOW,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  messageCampaign: {
    title: 'Email',
    type: WidgetType.MESSAGE_CAMPAIGN_BODY,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflowVersion: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_VERSION,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  workflowRun: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_RUN,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  emailThread: {
    title: 'Thread',
    type: WidgetType.EMAIL_THREAD,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
  },
} as const;
