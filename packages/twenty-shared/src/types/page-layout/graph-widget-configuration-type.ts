import { type PageLayoutWidgetConfiguration } from './page-layout-widget-configuration.type';

export const GRAPH_WIDGET_CONFIGURATION_TYPES = [
  'AGGREGATE_CHART',
  'PIE_CHART',
  'BAR_CHART',
  'LINE_CHART',
] as const satisfies readonly PageLayoutWidgetConfiguration['configurationType'][];

export type GraphWidgetConfigurationType =
  (typeof GRAPH_WIDGET_CONFIGURATION_TYPES)[number];
