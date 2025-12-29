import { plainToInstance } from 'class-transformer';
import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { validateSync, type ValidationError } from 'class-validator';

import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

export const validateWidgetConfigurationByDto = <
  T extends AllPageLayoutWidgetConfiguration,
>(
  DtoClass: ClassConstructor<T>,
  configuration: unknown,
): ValidationError[] => {
  const instance = plainToInstance(DtoClass, configuration);

  return validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });
};
