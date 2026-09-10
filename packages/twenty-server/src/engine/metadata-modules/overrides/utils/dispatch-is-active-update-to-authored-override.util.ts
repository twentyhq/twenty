import { type AllMetadataName } from 'twenty-shared/metadata';

import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';

type FlatEntityWithIsActive = {
  applicationUniversalIdentifier: string;
  isActive?: boolean;
  overrides?: unknown;
  universalOverrides?: unknown;
  isSystemSideEffect?: boolean;
};

// An overriding author, including the owner of an engine-managed row, writes
// its entry so a reset can drop it; any other author writes the column.
// isActive carries no foreign key, so universalOverrides takes the same entry
// change without a converter.
export const dispatchIsActiveUpdateToAuthoredOverride = <
  T extends FlatEntityWithIsActive,
>({
  metadataName,
  flatEntity,
  isActive,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: AllMetadataName;
  flatEntity: T;
  isActive: boolean;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): T => {
  const isAuthorOverridingEntity = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier: authorUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      flatEntity.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: flatEntity.isSystemSideEffect ?? false,
  });

  // Kinds without an overrides column, such as view filters, only carry the
  // column.
  if (!isAuthorOverridingEntity || !('overrides' in flatEntity)) {
    return { ...flatEntity, isActive };
  }

  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      flatEntity.applicationUniversalIdentifier,
  };
  const dispatchIsActive = (existingOverrides: unknown) =>
    dispatchUpdateToAuthoredOverride<{ isActive: boolean }>({
      metadataName,
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
