import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/utils/compute-metadata-overrides-blob.util';

type FlatEntityWithIsActive = {
  applicationUniversalIdentifier: string;
  isActive?: boolean;
  overrides?: unknown;
  universalOverrides?: unknown;
};

// Deactivation and restoration by a non-owner are attributed to that author:
// the entry records who did it and the column takes the effective value. The owner keeps writing the column, as for any of its properties.
// isActive carries no foreign key, so the universal twin of the blob takes
// the same entry change without a converter.
export const applyAuthoredIsActive = <T extends FlatEntityWithIsActive>({
  flatEntity,
  isActive,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatEntity: T;
  isActive: boolean;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): T => {
  // Kinds without an overrides column, such as view filters, only carry the
  // column.
  if (
    authorUniversalIdentifier === flatEntity.applicationUniversalIdentifier ||
    !('overrides' in flatEntity)
  ) {
    return { ...flatEntity, isActive };
  }

  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      flatEntity.applicationUniversalIdentifier,
  };
  const computeIsActiveBlob = (existingOverrides: unknown) =>
    computeMetadataOverridesBlob<{ isActive: boolean }>({
      overridableProperties: ['isActive'],
      updatedProperties: { isActive },
      existingEntity: flatEntity,
      existingOverrides,
      authorUniversalIdentifier,
      authorContext,
    });

  const { overrides, remainingProperties } = computeIsActiveBlob(
    flatEntity.overrides,
  );

  return {
    ...flatEntity,
    overrides,
    ...('universalOverrides' in flatEntity
      ? {
          universalOverrides: computeIsActiveBlob(flatEntity.universalOverrides)
            .overrides,
        }
      : {}),
    isActive: remainingProperties.isActive,
  };
};
