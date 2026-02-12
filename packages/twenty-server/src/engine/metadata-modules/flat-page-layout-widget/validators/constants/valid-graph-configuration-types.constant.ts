import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export const VALID_GRAPH_CONFIGURATION_TYPES = [
  WidgetConfigurationType.AGGREGATE_CHART,
  WidgetConfigurationType.BAR_CHART,
  WidgetConfigurationType.LINE_CHART,
  WidgetConfigurationType.PIE_CHART,
  WidgetConfigurationType.GAUGE_CHART,
] as const;
