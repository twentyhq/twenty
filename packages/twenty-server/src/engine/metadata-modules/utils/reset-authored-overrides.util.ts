import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/utils/remove-authored-override-entry.util';

type FlatEntityWithOverrides = {
  applicationUniversalIdentifier: string;
  overrides: unknown;
  universalOverrides?: unknown;
};

// A reset drops the caller's entry only: other authors keep theirs.
export const resetAuthoredOverrides = <T extends FlatEntityWithOverrides>({
  flatEntity,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatEntity: T;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): T => ({
  ...flatEntity,
  overrides: removeAuthoredOverrideEntry({
    overrides: flatEntity.overrides,
    authorUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }),
  ...('universalOverrides' in flatEntity
    ? {
        universalOverrides: removeAuthoredOverrideEntry({
          overrides: flatEntity.universalOverrides,
          authorUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      }
    : {}),
});
