import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { type GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { type LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { type PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export type GraphConfiguration =
  | BarChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO
  | AggregateChartConfigurationDTO
  | GaugeChartConfigurationDTO;

export type BaseGraphConfiguration = Pick<
  GraphConfiguration,
  'configurationType' | 'aggregateFieldMetadataId' | 'aggregateOperation'
>;

export const VALID_GRAPH_CONFIGURATION_TYPES = [
  WidgetConfigurationType.AGGREGATE_CHART,
  WidgetConfigurationType.BAR_CHART,
  WidgetConfigurationType.LINE_CHART,
  WidgetConfigurationType.PIE_CHART,
  WidgetConfigurationType.GAUGE_CHART,
] as const;

export const validateGraphConfigurationType = (
  configuration: GraphConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.configurationType)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration type is required for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration type is required`,
    });

    return errors;
  }

  const isValidGraphConfigurationType =
    VALID_GRAPH_CONFIGURATION_TYPES.includes(configuration.configurationType);

  if (!isValidGraphConfigurationType) {
    const expectedConfigurationTypes = VALID_GRAPH_CONFIGURATION_TYPES.map(
      (type) => type.toString(),
    ).join(', ');

    const configurationTypeString = configuration.configurationType.toString();

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for graph widget "${widgetTitle}". Expected one of ${expectedConfigurationTypes}, got ${configurationTypeString}`,
      userFriendlyMessage: msg`Invalid configuration type for graph widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};

export const validateBaseGraphFields = (
  configuration: BaseGraphConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.aggregateFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate field metadata ID is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate field is required for graph widget`,
    });
  }

  if (!isDefined(configuration.aggregateOperation)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate operation is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate operation is required for graph widget`,
    });
  }

  return errors;
};

export const validateBarChartConfiguration = (
  configuration: BarChartConfigurationDTO,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.primaryAxisGroupByFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Primary axis group by field is required for bar chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Primary axis group by field is required for bar chart`,
    });
  }

  if (!isDefined(configuration.layout)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Layout is required for bar chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Layout is required for bar chart`,
    });
  }

  return errors;
};

export const validateLineChartConfiguration = (
  configuration: LineChartConfigurationDTO,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.primaryAxisGroupByFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Primary axis group by field is required for line chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Primary axis group by field is required for line chart`,
    });
  }

  return errors;
};

export const validatePieChartConfiguration = (
  configuration: PieChartConfigurationDTO,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.groupByFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Group by field is required for pie chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Group by field is required for pie chart`,
    });
  }

  return errors;
};

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
