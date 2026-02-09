import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export const GRAPH_CONFIGURATION_TYPES = new Set<WidgetConfigurationType>([
  WidgetConfigurationType.AGGREGATE_CHART,
  WidgetConfigurationType.BAR_CHART,
  WidgetConfigurationType.GAUGE_CHART,
  WidgetConfigurationType.LINE_CHART,
  WidgetConfigurationType.PIE_CHART,
]);
