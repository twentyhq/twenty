import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/remove-authored-override-entry.util';

type FlatEntityWithOverrides = {
  applicationUniversalIdentifier: string;
  overrides: unknown;
  universalOverrides?: unknown;
};

// A reset drops the caller's entry only: other authors keep theirs.
export const resetAuthoredOverrides = <T extends FlatEntityWithOverrides>({
  flatEntity,
  authorUniversalIdentifier,
}: {
  flatEntity: T;
  authorUniversalIdentifier: string;
}): T => ({
  ...flatEntity,
  overrides: removeAuthoredOverrideEntry({
    overrides: flatEntity.overrides,
    authorUniversalIdentifier,
  }),
  ...('universalOverrides' in flatEntity
    ? {
        universalOverrides: removeAuthoredOverrideEntry({
          overrides: flatEntity.universalOverrides,
          authorUniversalIdentifier,
        }),
      }
    : {}),
});
