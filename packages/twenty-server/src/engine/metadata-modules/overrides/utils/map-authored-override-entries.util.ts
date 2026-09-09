import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';

export const mapAuthoredOverrideEntries = <TEntry, TMappedEntry>(
  overrides: AuthoredOverrides<TEntry>,
  mapEntry: (entry: TEntry) => TMappedEntry,
): AuthoredOverrides<TMappedEntry> =>
  Object.fromEntries(
    Object.entries(overrides)
      .filter((entry): entry is [string, TEntry] => isDefined(entry[1]))
      .map(([author, entry]) => [author, mapEntry(entry)]),
  );
