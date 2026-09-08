import { isDefined } from 'twenty-shared/utils';

import { isFlatOverridesBlob } from 'src/engine/metadata-modules/utils/is-flat-overrides-blob.util';
import { resolveMaterializedIsActive } from 'src/engine/metadata-modules/utils/resolve-materialized-is-active.util';

type FlatEntityWithIsActive = {
  applicationUniversalIdentifier: string;
  isActive: boolean;
  overrides: unknown;
  universalOverrides?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isDefined(value) && typeof value === 'object';

// An engine-driven deactivation is attributed to the owning application so a
// workspace reset, which only drops the custom entry, cannot reactivate it.
// Runs inside the migration build, which carries no workspace custom
// application identifier: a flat blob that predates author keys cannot be
// lifted here, so it keeps today's column-only write until the backfill runs.
export const applyOwnerAuthoredIsActive = <T extends FlatEntityWithIsActive>({
  flatEntity,
  isActive,
}: {
  flatEntity: T;
  isActive: boolean;
}): T => {
  const ownerApplicationUniversalIdentifier =
    flatEntity.applicationUniversalIdentifier;

  if (!isDefined(ownerApplicationUniversalIdentifier)) {
    return { ...flatEntity, isActive };
  }

  const authorContext = { ownerApplicationUniversalIdentifier };

  const writeOwnerEntry = (overrides: unknown): unknown => {
    const authoredOverrides = isRecord(overrides) ? overrides : {};

    if (isFlatOverridesBlob(authoredOverrides)) {
      return overrides;
    }

    const {
      [ownerApplicationUniversalIdentifier]: ownerEntry,
      ...otherEntries
    } = authoredOverrides;
    const { isActive: _previousIsActive, ...restOwnerEntry } = isRecord(
      ownerEntry,
    )
      ? ownerEntry
      : {};
    const nextOwnerEntry = isActive
      ? restOwnerEntry
      : { ...restOwnerEntry, isActive };
    const nextAuthoredOverrides =
      Object.keys(nextOwnerEntry).length > 0
        ? {
            ...otherEntries,
            [ownerApplicationUniversalIdentifier]: nextOwnerEntry,
          }
        : otherEntries;

    return Object.keys(nextAuthoredOverrides).length > 0
      ? nextAuthoredOverrides
      : null;
  };

  const overrides = writeOwnerEntry(flatEntity.overrides);
  const isLegacyFlatBlob =
    isRecord(flatEntity.overrides) && isFlatOverridesBlob(flatEntity.overrides);

  return {
    ...flatEntity,
    overrides,
    ...('universalOverrides' in flatEntity
      ? { universalOverrides: writeOwnerEntry(flatEntity.universalOverrides) }
      : {}),
    isActive: isLegacyFlatBlob
      ? isActive
      : resolveMaterializedIsActive({ overrides, authorContext }),
  };
};
