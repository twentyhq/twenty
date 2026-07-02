import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

type ComputeMetadataOverridesBlobArgs<
  TProperties extends object,
  TOverrides,
> = {
  overridableProperties: readonly string[];
  updatedProperties: TProperties;
  existingEntity: object;
  existingOverrides: TOverrides | null;
};

export const computeMetadataOverridesBlob = <
  TProperties extends object,
  TOverrides = Record<string, unknown>,
>({
  overridableProperties,
  updatedProperties,
  existingEntity,
  existingOverrides,
}: ComputeMetadataOverridesBlobArgs<TProperties, TOverrides>): {
  overrides: TOverrides | null;
  remainingProperties: TProperties;
} => {
  const remainingRecord: Record<string, unknown> = {
    ...(updatedProperties as unknown as Record<string, unknown>),
  };
  const existingRecord = existingEntity as Record<string, unknown>;

  const overrides = overridableProperties.reduce<Record<
    string,
    unknown
  > | null>(
    (acc, property) => {
      if (remainingRecord[property] === undefined) {
        return acc;
      }

      const propertyValue = remainingRecord[property];

      delete remainingRecord[property];

      if (fastDeepEqual(propertyValue, existingRecord[property])) {
        if (
          isDefined(acc) &&
          Object.prototype.hasOwnProperty.call(acc, property)
        ) {
          const { [property]: _removedProperty, ...restOverrides } = acc;

          return restOverrides;
        }

        return acc;
      }

      return {
        ...acc,
        [property]: propertyValue,
      };
    },
    existingOverrides as unknown as Record<string, unknown> | null,
  );

  const remainingProperties = remainingRecord as unknown as TProperties;

  if (isDefined(overrides) && Object.keys(overrides).length === 0) {
    return { overrides: null, remainingProperties };
  }

  return {
    overrides: overrides as unknown as TOverrides | null,
    remainingProperties,
  };
};
