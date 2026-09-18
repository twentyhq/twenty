// A tool names the widget that renders its calls in the AI chat. The client
// resolves the name it is given instead of switching on tool names, so a tool
// can change its presentation without a front-end release.
export const RECORDS_TOOL_WIDGET_NAME = 'records';

export const TOOL_WIDGET_NAMES = [RECORDS_TOOL_WIDGET_NAME] as const;

export type ToolWidgetName = (typeof TOOL_WIDGET_NAMES)[number];

export const isToolWidgetName = (value: string): value is ToolWidgetName =>
  TOOL_WIDGET_NAMES.includes(value as ToolWidgetName);

// Emitted by every record tool on its output, and rendered by the `records`
// widget as links to the real record.
export type ToolRecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};
