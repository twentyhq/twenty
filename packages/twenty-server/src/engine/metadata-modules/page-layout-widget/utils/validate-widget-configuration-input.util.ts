import { isNotEmptyObject, type ValidationError } from 'class-validator';
import { assertUnreachable } from 'twenty-shared/utils';

import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-by-dto.util';

const formatValidationErrors = (
  errors: ValidationError[],
  parentProperty?: string,
): string => {
  return errors
    .map((err) => {
      const propertyPath = parentProperty
        ? `${parentProperty}.${err.property}`
        : err.property;

      if (err.constraints) {
        const constraints = Object.values(err.constraints).join(', ');

        return `${propertyPath}: ${constraints}`;
      }

      if (err.children && err.children.length > 0) {
        return formatValidationErrors(err.children, propertyPath);
      }

      return `${propertyPath}: Unknown error`;
    })
    .join('; ');
};

export const validateWidgetConfigurationInput = ({
  configuration,
}: {
  configuration: unknown;
}): void => {
  if (!isNotEmptyObject(configuration)) {
    throw new PageLayoutWidgetException(
      'Invalid configuration: not an object',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const configurationRecord = configuration as Record<string, unknown>;

  if (
    !Object.prototype.hasOwnProperty.call(
      configurationRecord,
      'configurationType',
    )
  ) {
    throw new PageLayoutWidgetException(
      'Invalid configuration: missing configuration type',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const configurationType =
    configurationRecord.configurationType as WidgetConfigurationType;

  let errors: ValidationError[] = [];

  switch (configurationType) {
    case WidgetConfigurationType.BAR_CHART:
      errors = validateWidgetConfigurationByDto(
        BarChartConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.LINE_CHART:
      errors = validateWidgetConfigurationByDto(
        LineChartConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.PIE_CHART:
      errors = validateWidgetConfigurationByDto(
        PieChartConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.AGGREGATE_CHART:
      errors = validateWidgetConfigurationByDto(
        AggregateChartConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.GAUGE_CHART:
      errors = validateWidgetConfigurationByDto(
        GaugeChartConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.IFRAME:
      errors = validateWidgetConfigurationByDto(
        IframeConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      errors = validateWidgetConfigurationByDto(
        StandaloneRichTextConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.VIEW:
      throw new Error('View configuration is not supported yet');
    case WidgetConfigurationType.FIELD:
      throw new Error('Field configuration is not supported yet');
    case WidgetConfigurationType.FIELDS:
      throw new Error('Fields configuration is not supported yet');
    case WidgetConfigurationType.TIMELINE:
      throw new Error('Timeline configuration is not supported yet');
    case WidgetConfigurationType.TASKS:
      throw new Error('Tasks configuration is not supported yet');
    case WidgetConfigurationType.NOTES:
      throw new Error('Notes configuration is not supported yet');
    case WidgetConfigurationType.FILES:
      throw new Error('Files configuration is not supported yet');
    case WidgetConfigurationType.EMAILS:
      throw new Error('Emails configuration is not supported yet');
    case WidgetConfigurationType.CALENDAR:
      throw new Error('Calendar configuration is not supported yet');
    case WidgetConfigurationType.FIELD_RICH_TEXT:
      throw new Error('Field rich text configuration is not supported yet');
    case WidgetConfigurationType.WORKFLOW:
      throw new Error('Workflow configuration is not supported yet');
    case WidgetConfigurationType.WORKFLOW_VERSION:
      throw new Error('Workflow version configuration is not supported yet');
    case WidgetConfigurationType.WORKFLOW_RUN:
      throw new Error('Workflow run configuration is not supported yet');
    default:
      assertUnreachable(configurationType);
  }

  if (errors.length > 0) {
    throw new PageLayoutWidgetException(
      formatValidationErrors(errors),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
