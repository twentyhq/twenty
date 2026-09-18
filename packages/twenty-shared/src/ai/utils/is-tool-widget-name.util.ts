import {
  TOOL_WIDGET_NAMES,
  type ToolWidgetName,
} from '../constants/tool-widget-name.const';

export const isToolWidgetName = (value: string): value is ToolWidgetName =>
  (TOOL_WIDGET_NAMES as readonly string[]).includes(value);
