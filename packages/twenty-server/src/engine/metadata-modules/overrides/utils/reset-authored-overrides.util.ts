import { type AllMetadataName } from 'twenty-shared/metadata';

import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/remove-authored-override-entry.util';

type FlatEntityWithOverrides = {
  applicationUniversalIdentifier: string;
  overrides: unknown;
  universalOverrides?: unknown;
};

// A reset drops the caller's entry only: other authors keep theirs.
export const resetAuthoredOverrides = <T extends FlatEntityWithOverrides>({
  metadataName,
  flatEntity,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: AllMetadataName;
  flatEntity: T;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): T => ({
  ...flatEntity,
  overrides: removeAuthoredOverrideEntry({
    metadataName,
    overrides: flatEntity.overrides,
    authorUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }),
  ...('universalOverrides' in flatEntity
    ? {
        universalOverrides: removeAuthoredOverrideEntry({
          metadataName,
          overrides: flatEntity.universalOverrides,
          authorUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      }
    : {}),
});
