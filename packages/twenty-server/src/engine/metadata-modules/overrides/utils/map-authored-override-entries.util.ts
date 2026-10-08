import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

export const mapAuthoredOverrideEntries = <TEntry, TMappedEntry>({
  metadataName,
  overrides,
  mapEntry,
}: {
  metadataName: AllMetadataName;
  overrides: AuthoredOverrides<TEntry>;
  mapEntry: (entry: TEntry) => TMappedEntry;
}): AuthoredOverrides<TMappedEntry> => {
  if (
    isLegacyNonAuthoredOverride({
      metadataName,
      overrides: overrides as Record<string, unknown>,
    })
  ) {
    return mapEntry(
      overrides as unknown as TEntry,
    ) as unknown as AuthoredOverrides<TMappedEntry>;
  }

  return Object.fromEntries(
    Object.entries(overrides)
      .filter((entry): entry is [string, TEntry] => isDefined(entry[1]))
      .map(([author, entry]) => [author, mapEntry(entry)]),
  );
};
