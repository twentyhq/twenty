import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/utils/compute-metadata-overrides-blob.util';

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
  if (!shouldOverride) {
    return {
      overrides: existingFlatEntity.overrides,
      updatedEditableProperties,
    };
  }

  const { overrides, remainingProperties } = computeMetadataOverridesBlob({
    overridableProperties: ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
      metadataName
    ] as string[],
    updatedProperties: updatedEditableProperties,
    existingEntity: existingFlatEntity,
    existingOverrides: existingFlatEntity.overrides,
  });

  return { overrides, updatedEditableProperties: remainingProperties };
};
