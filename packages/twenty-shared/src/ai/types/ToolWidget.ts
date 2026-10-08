// Tools name their widget so a tool can change its presentation without a front-end release.
export const RECORDS_TOOL_WIDGET_NAME = 'records';

export const TOOL_WIDGET_NAMES = [RECORDS_TOOL_WIDGET_NAME] as const;

export type ToolWidgetName = (typeof TOOL_WIDGET_NAMES)[number];

export const isToolWidgetName = (value: string): value is ToolWidgetName =>
  TOOL_WIDGET_NAMES.includes(value as ToolWidgetName);

export type ToolRecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};
