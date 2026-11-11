import { instanceToPlain, plainToInstance } from 'class-transformer';
import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { validateSync, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

export const sanitizeWidgetConfigurationByDto = <
  TConfiguration extends AllPageLayoutWidgetConfiguration,
>({
  DtoClass,
  configuration,
}: {
  DtoClass: ClassConstructor<TConfiguration>;
  configuration: Record<string, unknown>;
}): { sanitizedConfiguration: TConfiguration; errors: ValidationError[] } => {
  const instance = plainToInstance(DtoClass, configuration);

  // whitelist removes the keys the DTO does not declare from the instance, whether or not it is valid
  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  // An unset setting is stored absent: clients send back the null GraphQL returns for it
  const sanitizedConfiguration = Object.fromEntries(
    Object.entries(instanceToPlain(instance)).filter(([, value]) =>
      isDefined(value),
    ),
  ) as TConfiguration;

  return { sanitizedConfiguration, errors };
};
