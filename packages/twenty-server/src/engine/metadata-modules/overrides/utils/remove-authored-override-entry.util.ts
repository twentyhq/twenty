import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';

export const removeAuthoredOverrideEntry = <TEntry>({
  overrides,
  authorUniversalIdentifier,
}: {
  overrides: unknown;
  authorUniversalIdentifier: string;
}): AuthoredOverrides<TEntry> | null => {
  if (!isDefined(overrides) || typeof overrides !== 'object') {
    return null;
  }

  const { [authorUniversalIdentifier]: _removedEntry, ...otherEntries } =
    overrides as AuthoredOverrides<TEntry>;

  return Object.keys(otherEntries).length > 0 ? otherEntries : null;
};
