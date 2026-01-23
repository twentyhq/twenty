import { isNotEmptyObject, type ValidationError } from 'class-validator';

import { AggregateChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.validation-schema';
import { BarChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.validation-schema';
import { GaugeChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.validation-schema';
import { IframeConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.validation-schema';
import { LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.validation-schema';
import { PieChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.validation-schema';
import { StandaloneRichTextConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.validation-schema';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetConfigurationByValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-by-validation-schema.util';

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
      errors = validateWidgetConfigurationByValidationSchema(
        BarChartConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.LINE_CHART:
      errors = validateWidgetConfigurationByValidationSchema(
        LineChartConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.PIE_CHART:
      errors = validateWidgetConfigurationByValidationSchema(
        PieChartConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.AGGREGATE_CHART:
      errors = validateWidgetConfigurationByValidationSchema(
        AggregateChartConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.GAUGE_CHART:
      errors = validateWidgetConfigurationByValidationSchema(
        GaugeChartConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.IFRAME:
      errors = validateWidgetConfigurationByValidationSchema(
        IframeConfigurationValidationSchema,
        configuration,
      );
      break;
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      errors = validateWidgetConfigurationByValidationSchema(
        StandaloneRichTextConfigurationValidationSchema,
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
