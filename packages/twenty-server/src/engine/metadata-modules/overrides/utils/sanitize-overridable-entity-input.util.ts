import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/overrides/utils/compute-metadata-overrides-blob.util';

type FlatEntityWithOverrides<TEntry> = {
  [key: string]: unknown;
  applicationUniversalIdentifier: string;
  overrides: AuthoredOverrides<TEntry> | null;
};

export const sanitizeOverridableEntityInput = <
  T extends AllMetadataName,
  TProperties extends Record<string, unknown>,
  TEntry = Record<string, unknown>,
>({
  metadataName,
  existingFlatEntity,
  updatedEditableProperties,
  shouldOverride,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: T;
  existingFlatEntity: FlatEntityWithOverrides<TEntry>;
  updatedEditableProperties: TProperties;
  shouldOverride: boolean;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): {
  overrides: AuthoredOverrides<TEntry> | null;
  updatedEditableProperties: TProperties;
} => {
  if (!shouldOverride) {
    return {
      overrides: existingFlatEntity.overrides,
      updatedEditableProperties,
    };
  }

  const { overrides, remainingProperties } = computeMetadataOverridesBlob<
    TProperties,
    TEntry
  >({
    overridableProperties: ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
      metadataName
    ] as string[],
    updatedProperties: updatedEditableProperties,
    existingEntity: existingFlatEntity,
    existingOverrides: existingFlatEntity.overrides,
    authorUniversalIdentifier: callerApplicationUniversalIdentifier,
    authorContext: {
      workspaceCustomApplicationUniversalIdentifier,
      ownerApplicationUniversalIdentifier:
        existingFlatEntity.applicationUniversalIdentifier,
    },
  });

  return { overrides, updatedEditableProperties: remainingProperties };
};
