import isEqual from 'lodash.isequal';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';

type FlatEntityWithOverrides = {
  [key: string]: unknown;
  overrides: Record<string, unknown> | null;
};

export const sanitizeOverridableEntityInput = <
  T extends AllMetadataName,
  TProperties extends Record<string, unknown>,
>({
  metadataName,
  existingFlatEntity,
  updatedEditableProperties,
  shouldOverride,
}: {
  metadataName: T;
  existingFlatEntity: FlatEntityWithOverrides;
  updatedEditableProperties: TProperties;
  shouldOverride: boolean;
}): {
  overrides: Record<string, unknown> | null;
  updatedEditableProperties: TProperties;
} => {
  const existingOverrides = existingFlatEntity.overrides;

  if (!shouldOverride) {
    return {
      overrides: existingOverrides,
      updatedEditableProperties,
    };
  }

  const sanitizedEditableProperties = {
    ...updatedEditableProperties,
  } as TProperties;

  const overridableProperties = ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
    metadataName
  ] as string[];

  const overrides = overridableProperties.reduce<Record<
    string,
    unknown
  > | null>((acc, property) => {
    const isPropertyUpdated =
      sanitizedEditableProperties[property] !== undefined;

    if (!isPropertyUpdated) {
      return acc;
    }

    const propertyValue = sanitizedEditableProperties[property];

    delete sanitizedEditableProperties[property];

    if (isEqual(propertyValue, existingFlatEntity[property])) {
      if (
        isDefined(acc) &&
        Object.prototype.hasOwnProperty.call(acc, property)
      ) {
        const { [property]: _, ...restOverrides } = acc;

        return restOverrides;
      }

      return acc;
    }

    return {
      ...acc,
      [property]: propertyValue,
    };
  }, existingOverrides);

  if (isDefined(overrides) && Object.keys(overrides).length === 0) {
    return {
      overrides: null,
      updatedEditableProperties: sanitizedEditableProperties,
    };
  }

  return { overrides, updatedEditableProperties: sanitizedEditableProperties };
};
