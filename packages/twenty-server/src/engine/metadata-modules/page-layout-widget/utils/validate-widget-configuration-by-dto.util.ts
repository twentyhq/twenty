import { isNull } from '@sniptt/guards';
import { plainToInstance } from 'class-transformer';
import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { validateSync, ValidationError } from 'class-validator';
import { PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const buildNullValueValidationError = (property: string): ValidationError =>
  Object.assign(new ValidationError(), {
    property,
    value: null,
    constraints: { isNotNull: `${property} should not be null` },
  });

export const validateWidgetConfigurationByDto = <
  TConfiguration extends AllPageLayoutWidgetConfiguration,
>({
  DtoClass,
  configurationType,
  configuration,
}: {
  DtoClass: ClassConstructor<TConfiguration>;
  configurationType: WidgetConfigurationType;
  configuration: Record<string, unknown>;
}): ValidationError[] => {
  const instance = plainToInstance(DtoClass, configuration);

  const dtoErrors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });

  const nullableKeys =
    PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE[
      configurationType
    ];

  // @IsOptional lets null through, but the shared types only allow it on these keys
  const nullValueErrors = Object.entries(configuration)
    .filter(([key, value]) => isNull(value) && !isDefined(nullableKeys[key]))
    .map(([key]) => buildNullValueValidationError(key));

  return [...dtoErrors, ...nullValueErrors];
};
