import { isNotEmptyObject, type ValidationError } from 'class-validator';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-configuration-input-dto-by-type.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { sanitizeWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/sanitize-widget-configuration-by-dto.util';

const UNSUPPORTED_WIDGET_CONFIGURATION_LABEL_BY_TYPE: Partial<
  Record<WidgetConfigurationType, string>
> = {
  [WidgetConfigurationType.VIEW]: 'View',
  [WidgetConfigurationType.FIELDS]: 'Fields',
  [WidgetConfigurationType.TIMELINE]: 'Timeline',
  [WidgetConfigurationType.TASKS]: 'Tasks',
  [WidgetConfigurationType.NOTES]: 'Notes',
  [WidgetConfigurationType.FILES]: 'Files',
  [WidgetConfigurationType.EMAILS]: 'Emails',
  [WidgetConfigurationType.CALENDAR]: 'Calendar',
  [WidgetConfigurationType.FIELD_RICH_TEXT]: 'Field rich text',
  [WidgetConfigurationType.WORKFLOW]: 'Workflow',
  [WidgetConfigurationType.WORKFLOW_VERSION]: 'Workflow version',
  [WidgetConfigurationType.WORKFLOW_RUN]: 'Workflow run',
};

const formatValidationErrors = ({
  errors,
  parentProperty,
}: {
  errors: ValidationError[];
  parentProperty?: string;
}): string => {
  return errors
    .map((error) => {
      const propertyPath = isDefined(parentProperty)
        ? `${parentProperty}.${error.property}`
        : error.property;

      if (isDefined(error.constraints)) {
        const constraints = Object.values(error.constraints).join(', ');

        return `${propertyPath}: ${constraints}`;
      }

      if (isNonEmptyArray(error.children)) {
        return formatValidationErrors({
          errors: error.children,
          parentProperty: propertyPath,
        });
      }

      return `${propertyPath}: Unknown error`;
    })
    .join('; ');
};

export const sanitizeWidgetConfigurationInputOrThrow = ({
  configuration,
}: {
  configuration: unknown;
}): AllPageLayoutWidgetConfiguration => {
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

  const WidgetConfigurationDto =
    WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE[configurationType];

  if (!isDefined(WidgetConfigurationDto)) {
    const unsupportedTypeLabel =
      UNSUPPORTED_WIDGET_CONFIGURATION_LABEL_BY_TYPE[configurationType];

    throw new PageLayoutWidgetException(
      isDefined(unsupportedTypeLabel)
        ? `${unsupportedTypeLabel} configuration is not supported yet`
        : `Invalid configuration type: ${configurationType}`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const { sanitizedConfiguration, errors } = sanitizeWidgetConfigurationByDto({
    DtoClass: WidgetConfigurationDto,
    configuration: configurationRecord,
  });

  if (errors.length > 0) {
    throw new PageLayoutWidgetException(
      formatValidationErrors({ errors }),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  return sanitizedConfiguration;
};
