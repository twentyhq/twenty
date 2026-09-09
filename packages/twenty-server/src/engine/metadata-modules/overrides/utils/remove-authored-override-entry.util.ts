import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';

export const removeAuthoredOverrideEntry = <TEntry>({
  overrides,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  overrides: unknown;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): AuthoredOverrides<TEntry> | null => {
  const authoredOverrides = normalizeAuthoredOverrides<TEntry>({
    overrides,
    workspaceCustomApplicationUniversalIdentifier,
  });

  if (!isDefined(authoredOverrides)) {
    return null;
  }

  const { [authorUniversalIdentifier]: _removedEntry, ...otherEntries } =
    authoredOverrides;

  return Object.keys(otherEntries).length > 0 ? otherEntries : null;
};
