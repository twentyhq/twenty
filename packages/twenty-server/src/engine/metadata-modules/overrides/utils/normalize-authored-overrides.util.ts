import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

// Rows written before overrides became author-keyed hold a single flat entry.
// Every such entry was authored by the workspace custom application, the only
// writer at the time, so it lifts under that key. Flat keys are property names
// and author keys are application identifiers, so the two shapes cannot be
// confused. The backfill rewrites storage; until it has run, this keeps
// in-memory overrides author-keyed.
export const normalizeAuthoredOverrides = <TEntry>({
  metadataName,
  overrides,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: AllMetadataName;
  overrides: unknown;
  workspaceCustomApplicationUniversalIdentifier: string;
}): AuthoredOverrides<TEntry> | null => {
  if (!isDefined(overrides) || typeof overrides !== 'object') {
    return null;
  }

  const overridesRecord = overrides as Record<string, unknown>;

  if (
    !isLegacyNonAuthoredOverride({ metadataName, overrides: overridesRecord })
  ) {
    return overridesRecord as AuthoredOverrides<TEntry>;
  }

  return {
    [workspaceCustomApplicationUniversalIdentifier]: overridesRecord as TEntry,
  };
};
