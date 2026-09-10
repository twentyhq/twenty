import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';

type FlatEntityWithIsActive = {
  applicationUniversalIdentifier: string;
  isActive?: boolean;
  overrides?: unknown;
  universalOverrides?: unknown;
};

// The owner writes the column, as for any of its properties; another author
// writes its entry and readers resolve the effective value from there.
// isActive carries no foreign key, so universalOverrides takes the same entry
// change without a converter.
export const dispatchIsActiveUpdateToAuthoredOverride = <
  T extends FlatEntityWithIsActive,
>({
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
  const dispatchIsActive = (existingOverrides: unknown) =>
    dispatchUpdateToAuthoredOverride<{ isActive: boolean }>({
      overridableProperties: ['isActive'],
      updatedProperties: { isActive },
      existingEntity: flatEntity,
      existingOverrides,
      authorUniversalIdentifier,
      authorContext,
    }).overrides;

  return {
    ...flatEntity,
    overrides: dispatchIsActive(flatEntity.overrides),
    ...('universalOverrides' in flatEntity
      ? {
          universalOverrides: dispatchIsActive(flatEntity.universalOverrides),
        }
      : {}),
  };
};
