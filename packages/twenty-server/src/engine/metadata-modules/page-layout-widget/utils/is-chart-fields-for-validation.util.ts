import { GRAPH_CONFIGURATION_TYPES } from 'src/engine/metadata-modules/page-layout-widget/constants/graph-configuration-types.constant';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type ChartFieldsForValidation } from 'src/engine/metadata-modules/page-layout-widget/types/chart-fields-for-validation.type';

export const isChartFieldsForValidation = (
  configuration: AllPageLayoutWidgetConfiguration,
): configuration is ChartFieldsForValidation =>
  GRAPH_CONFIGURATION_TYPES.has(configuration.configurationType);
