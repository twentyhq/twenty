import { RECORDS_TOOL_WIDGET_NAME } from './records-tool-widget-name.const';

// A tool names the widget that renders its calls in the AI chat. The client
// resolves the name it is given instead of switching on tool names, so a tool
// can change its presentation without a front-end release.
export const TOOL_WIDGET_NAMES = [RECORDS_TOOL_WIDGET_NAME] as const;

export type ToolWidgetName = (typeof TOOL_WIDGET_NAMES)[number];
