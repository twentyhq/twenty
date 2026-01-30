import { isNotEmptyObject, type ValidationError } from 'class-validator';

import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { FrontComponentConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto';
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
    case WidgetConfigurationType.FRONT_COMPONENT:
      errors = validateWidgetConfigurationByDto(
        FrontComponentConfigurationDTO,
        configuration,
      );
      break;
    case WidgetConfigurationType.VIEW:
      throw new PageLayoutWidgetException(
        'View configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.FIELD:
      throw new PageLayoutWidgetException(
        'Field configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.FIELDS:
      throw new PageLayoutWidgetException(
        'Fields configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.TIMELINE:
      throw new PageLayoutWidgetException(
        'Timeline configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.TASKS:
      throw new PageLayoutWidgetException(
        'Tasks configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.NOTES:
      throw new PageLayoutWidgetException(
        'Notes configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.FILES:
      throw new PageLayoutWidgetException(
        'Files configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.EMAILS:
      throw new PageLayoutWidgetException(
        'Emails configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.CALENDAR:
      throw new PageLayoutWidgetException(
        'Calendar configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.FIELD_RICH_TEXT:
      throw new PageLayoutWidgetException(
        'Field rich text configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.WORKFLOW:
      throw new PageLayoutWidgetException(
        'Workflow configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.WORKFLOW_VERSION:
      throw new PageLayoutWidgetException(
        'Workflow version configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    case WidgetConfigurationType.WORKFLOW_RUN:
      throw new PageLayoutWidgetException(
        'Workflow run configuration is not supported yet',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    default:
      throw new PageLayoutWidgetException(
        `Invalid configuration type: ${configurationType}`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
  }

  if (errors.length > 0) {
    throw new PageLayoutWidgetException(
      formatValidationErrors(errors),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
