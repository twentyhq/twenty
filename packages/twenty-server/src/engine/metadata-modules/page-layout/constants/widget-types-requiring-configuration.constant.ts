import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

export const WIDGET_TYPES_REQUIRING_CONFIGURATION: WidgetType[] = [
  WidgetType.GRAPH,
  WidgetType.IFRAME,
  WidgetType.STANDALONE_RICH_TEXT,
];
