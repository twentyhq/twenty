import { dispatchIsActiveUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-is-active-update-to-authored-override.util';

type EntityWithApplicationIdentifier = {
  applicationUniversalIdentifier: string;
  isActive?: boolean;
  overrides?: unknown;
  isSystemSideEffect?: boolean;
};

export const splitEntitiesByRemovalStrategy = <
  T extends EntityWithApplicationIdentifier,
>({
  entitiesToRemove,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  entitiesToRemove: T[];
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): {
  toHardDelete: T[];
  toDeactivate: (T & { updatedAt: string })[];
} => {
  const toHardDelete: T[] = [];
  const toDeactivate: (T & { updatedAt: string })[] = [];

  for (const entity of entitiesToRemove) {
    if (
      entity.applicationUniversalIdentifier ===
        workspaceCustomApplicationUniversalIdentifier &&
      !entity.isSystemSideEffect
    ) {
      toHardDelete.push(entity);
    } else {
      toDeactivate.push({
        ...dispatchIsActiveUpdateToAuthoredOverride({
          flatEntity: entity,
          isActive: false,
          authorUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
        updatedAt: now,
      });
    }
  }

  return { toHardDelete, toDeactivate };
};
