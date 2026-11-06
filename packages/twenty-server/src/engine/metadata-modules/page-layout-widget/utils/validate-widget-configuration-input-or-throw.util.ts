import { isNotEmptyObject, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-configuration-input-dto-by-type.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-by-dto.util';

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

const formatValidationErrors = (
  errors: ValidationError[],
  parentProperty?: string,
): string => {
  return errors
    .map((error) => {
      const propertyPath = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;

      if (error.constraints) {
        const constraints = Object.values(error.constraints).join(', ');

        return `${propertyPath}: ${constraints}`;
      }

      if (error.children && error.children.length > 0) {
        return formatValidationErrors(error.children, propertyPath);
      }

      return `${propertyPath}: Unknown error`;
    })
    .join('; ');
};

export const validateWidgetConfigurationInputOrThrow = ({
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

  const errors = validateWidgetConfigurationByDto({
    DtoClass: WidgetConfigurationDto,
    configuration: configurationRecord,
  });

  if (errors.length > 0) {
    throw new PageLayoutWidgetException(
      formatValidationErrors(errors),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
