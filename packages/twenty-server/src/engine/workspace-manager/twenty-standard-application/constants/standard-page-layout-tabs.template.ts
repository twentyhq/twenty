import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetCanvasPosition,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetVerticalListPosition,
} from 'twenty-shared/types';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';

export const CONDITIONAL_DISPLAY_DEVICE_MOBILE = {
  and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
} as const satisfies PageLayoutWidgetConditionalDisplay;

export const CONDITIONAL_DISPLAY_DEVICE_DESKTOP = {
  and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
} as const satisfies PageLayoutWidgetConditionalDisplay;

export const GRID_POSITIONS = {
  FULL_WIDTH: {
    row: 0,
    column: 0,
    rowSpan: 12,
    columnSpan: 12,
  },
  HALF_HEIGHT: {
    row: 0,
    column: 0,
    rowSpan: 6,
    columnSpan: 12,
  },
  RICH_TEXT: {
    row: 12,
    column: 0,
    rowSpan: 6,
    columnSpan: 12,
  },
} as const satisfies Record<string, GridPosition>;

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
} as const satisfies Record<string, PageLayoutWidgetVerticalListPosition>;

export const CANVAS_LAYOUT_POSITIONS = {
  DEFAULT: {
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
} as const satisfies Record<string, PageLayoutWidgetCanvasPosition>;

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
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  tasks: {
    title: 'Tasks',
    position: 30,
    icon: 'IconCheckbox',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  notes: {
    title: 'Notes',
    position: 40,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  files: {
    title: 'Files',
    position: 50,
    icon: 'IconPaperclip',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  emails: {
    title: 'Emails',
    position: 60,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  calendar: {
    title: 'Calendar',
    position: 70,
    icon: 'IconCalendarEvent',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  note: {
    title: 'Note',
    position: 15,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  flow: {
    title: 'Flow',
    position: 10,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  flowSecondary: {
    title: 'Flow',
    position: 20,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
} as const;

export const WIDGET_PROPS = {
  fields: {
    title: 'Fields',
    type: WidgetType.FIELDS,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
    position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
  },
  timeline: {
    title: 'Timeline',
    type: WidgetType.TIMELINE,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  tasks: {
    title: 'Tasks',
    type: WidgetType.TASKS,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  notes: {
    title: 'Notes',
    type: WidgetType.NOTES,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  files: {
    title: 'Files',
    type: WidgetType.FILES,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  emails: {
    title: 'Emails',
    type: WidgetType.EMAILS,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  calendar: {
    title: 'Calendar',
    type: WidgetType.CALENDAR,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  noteRichText: {
    title: 'Note',
    type: WidgetType.FIELD_RICH_TEXT,
    gridPosition: GRID_POSITIONS.RICH_TEXT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  taskRichText: {
    title: 'Task',
    type: WidgetType.FIELD_RICH_TEXT,
    gridPosition: GRID_POSITIONS.RICH_TEXT,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  workflow: {
    title: 'Flow',
    type: WidgetType.WORKFLOW,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  workflowVersion: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_VERSION,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
  workflowRun: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_RUN,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
    position: CANVAS_LAYOUT_POSITIONS.DEFAULT,
  },
} as const;
