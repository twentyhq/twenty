import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/utils/remove-authored-override-entry.util';
import { resolveMaterializedIsActive } from 'src/engine/metadata-modules/utils/resolve-materialized-is-active.util';

type FlatEntityWithOverrides = {
  applicationUniversalIdentifier: string;
  isActive: boolean;
  overrides: unknown;
  universalOverrides?: unknown;
};

// A reset drops the caller's entry only: other authors keep theirs, and the
// isActive column follows whatever they still say.
export const resetAuthoredOverrides = <T extends FlatEntityWithOverrides>({
  flatEntity,
  authorUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatEntity: T;
  authorUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): T => {
  const overrides = removeAuthoredOverrideEntry({
    overrides: flatEntity.overrides,
    authorUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });

  return {
    ...flatEntity,
    overrides,
    ...('universalOverrides' in flatEntity
      ? {
          universalOverrides: removeAuthoredOverrideEntry({
            overrides: flatEntity.universalOverrides,
            authorUniversalIdentifier,
            workspaceCustomApplicationUniversalIdentifier,
          }),
        }
      : {}),
    isActive: resolveMaterializedIsActive({
      overrides,
      authorContext: {
        workspaceCustomApplicationUniversalIdentifier,
        ownerApplicationUniversalIdentifier:
          flatEntity.applicationUniversalIdentifier,
      },
    }),
  };
};
