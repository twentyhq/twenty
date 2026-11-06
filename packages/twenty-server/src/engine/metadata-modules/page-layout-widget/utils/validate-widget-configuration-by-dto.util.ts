import { plainToInstance } from 'class-transformer';
import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { validateSync, type ValidationError } from 'class-validator';
import { type PageLayoutWidgetConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

type NullableKeysOf<TConfiguration> = TConfiguration extends unknown
  ? {
      [TKey in keyof TConfiguration]-?: null extends TConfiguration[TKey]
        ? TKey
        : never;
    }[keyof TConfiguration]
  : never;

const NULLABLE_CONFIGURATION_KEYS: Record<string, true> = {
  viewId: true,
  newFieldDefaultVisibility: true,
  nestedRelationFieldMetadataId: true,
} satisfies Record<NullableKeysOf<PageLayoutWidgetConfiguration>, true>;

// Keeps only DTO keys, so settings from another chart type go and a cleared setting is absent, as the types describe
export const validateWidgetConfigurationByDto = <
  TConfiguration extends AllPageLayoutWidgetConfiguration,
>({
  DtoClass,
  configuration,
}: {
  DtoClass: ClassConstructor<TConfiguration>;
  configuration: Record<string, unknown>;
}): {
  errors: ValidationError[];
  sanitizedConfiguration: Record<string, unknown>;
} => {
  const instance = plainToInstance(DtoClass, configuration);

  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  // whitelist strips undeclared keys from the validated instance only
  const sanitizedConfiguration = Object.fromEntries(
    Object.entries(configuration).filter(
      ([key, value]) =>
        Object.prototype.hasOwnProperty.call(instance, key) &&
        (isDefined(value) || isDefined(NULLABLE_CONFIGURATION_KEYS[key])),
    ),
  );

  return { errors, sanitizedConfiguration };
};
