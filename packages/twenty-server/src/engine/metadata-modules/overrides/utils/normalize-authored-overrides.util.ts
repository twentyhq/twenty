import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

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
