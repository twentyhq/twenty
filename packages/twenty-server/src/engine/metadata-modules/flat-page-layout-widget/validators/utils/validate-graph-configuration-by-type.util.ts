import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateBarChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-bar-chart-configuration.util';
import { validateLineChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-line-chart-configuration.util';
import { validatePieChartConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-pie-chart-configuration.util';
import {
  type AllGraphWidgetConfigurationType,
  WidgetConfigurationType,
} from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateGraphConfigurationByType = ({
  graphUniversalConfiguration,
  widgetTitle,
}: {
  graphUniversalConfiguration: UniversalFlatPageLayoutWidget<AllGraphWidgetConfigurationType>['universalConfiguration'];
  widgetTitle: string;
}): FlatPageLayoutWidgetValidationError[] => {
  const configurationType = graphUniversalConfiguration.configurationType;

  switch (configurationType) {
    case WidgetConfigurationType.BAR_CHART:
      return validateBarChartConfiguration({
        graphUniversalConfiguration,
        widgetTitle,
      });
    case WidgetConfigurationType.LINE_CHART:
      return validateLineChartConfiguration({
        graphUniversalConfiguration,
        widgetTitle,
      });
    case WidgetConfigurationType.PIE_CHART:
      return validatePieChartConfiguration({
        graphUniversalConfiguration,
        widgetTitle,
      });
    case WidgetConfigurationType.AGGREGATE_CHART:
    case WidgetConfigurationType.GAUGE_CHART:
      return [];
    default:
      return [];
  }
};
