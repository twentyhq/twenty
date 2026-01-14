import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type GraphConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/graph-configuration.type';
import { validateBarChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-bar-chart-configuration.util';
import { validateLineChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-line-chart-configuration.util';
import { validatePieChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-pie-chart-configuration.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export const validateGraphConfigurationByType = (
  configuration: GraphConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const configurationType = configuration.configurationType;

  switch (configurationType) {
    case WidgetConfigurationType.BAR_CHART:
      return validateBarChartConfiguration(configuration, widgetTitle);
    case WidgetConfigurationType.LINE_CHART:
      return validateLineChartConfiguration(configuration, widgetTitle);
    case WidgetConfigurationType.PIE_CHART:
      return validatePieChartConfiguration(configuration, widgetTitle);
    case WidgetConfigurationType.AGGREGATE_CHART:
    case WidgetConfigurationType.GAUGE_CHART:
      return [];
    default:
      return [];
  }
};
