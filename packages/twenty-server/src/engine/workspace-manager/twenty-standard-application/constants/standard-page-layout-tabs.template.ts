import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';

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

export const TAB_PROPS = {
  home: {
    title: 'Home',
    position: 100,
    icon: 'IconHome',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  },
  timeline: {
    title: 'Timeline',
    position: 200,
    icon: 'IconTimelineEvent',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  tasks: {
    title: 'Tasks',
    position: 300,
    icon: 'IconCheckbox',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  notes: {
    title: 'Notes',
    position: 400,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  files: {
    title: 'Files',
    position: 500,
    icon: 'IconPaperclip',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  emails: {
    title: 'Emails',
    position: 600,
    icon: 'IconMail',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  calendar: {
    title: 'Calendar',
    position: 700,
    icon: 'IconCalendarEvent',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  note: {
    title: 'Note',
    position: 150,
    icon: 'IconNotes',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  flow: {
    title: 'Flow',
    position: 100,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
  flowSecondary: {
    title: 'Flow',
    position: 200,
    icon: 'IconSettings',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
  },
} as const;

export const WIDGET_PROPS = {
  fields: {
    title: 'Fields',
    type: WidgetType.FIELDS,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
  },
  timeline: {
    title: 'Timeline',
    type: WidgetType.TIMELINE,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  tasks: {
    title: 'Tasks',
    type: WidgetType.TASKS,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  notes: {
    title: 'Notes',
    type: WidgetType.NOTES,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  files: {
    title: 'Files',
    type: WidgetType.FILES,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  emails: {
    title: 'Emails',
    type: WidgetType.EMAILS,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  calendar: {
    title: 'Calendar',
    type: WidgetType.CALENDAR,
    gridPosition: GRID_POSITIONS.HALF_HEIGHT,
  },
  richText: {
    title: 'Note',
    type: WidgetType.FIELD_RICH_TEXT,
    gridPosition: GRID_POSITIONS.RICH_TEXT,
  },
  workflow: {
    title: 'Flow',
    type: WidgetType.WORKFLOW,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
  },
  workflowVersion: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_VERSION,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
  },
  workflowRun: {
    title: 'Flow',
    type: WidgetType.WORKFLOW_RUN,
    gridPosition: GRID_POSITIONS.FULL_WIDTH,
  },
} as const;
