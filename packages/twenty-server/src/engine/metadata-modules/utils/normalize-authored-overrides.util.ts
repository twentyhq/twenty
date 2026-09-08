import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/utils/authored-overrides.type';
import { isFlatOverridesBlob } from 'src/engine/metadata-modules/utils/is-flat-overrides-blob.util';

// Rows written before the blob became author-keyed hold a single flat entry.
// Every such entry was authored by the workspace custom application, the only
// writer at the time, so it lifts under that key. Flat keys are property names
// and author keys are application identifiers, so the two shapes cannot be
// confused. The backfill rewrites storage; until it has run, this keeps
// in-memory blobs author-keyed.
export const normalizeAuthoredOverrides = <TEntry>({
  overrides,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  overrides: unknown;
  workspaceCustomApplicationUniversalIdentifier: string;
}): AuthoredOverrides<TEntry> | null => {
  if (!isDefined(overrides) || typeof overrides !== 'object') {
    return null;
  }

  const overridesRecord = overrides as Record<string, unknown>;

  if (!isFlatOverridesBlob(overridesRecord)) {
    return overridesRecord as AuthoredOverrides<TEntry>;
  }

  return {
    [workspaceCustomApplicationUniversalIdentifier]: overridesRecord as TEntry,
  };
};
