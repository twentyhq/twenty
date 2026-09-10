import { type AllMetadataName } from 'twenty-shared/metadata';

import { resetAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/reset-authored-overrides.util';

type EntityWithApplicationIdentifierAndOverrides = {
  applicationUniversalIdentifier: string;
  isActive: boolean;
  overrides: unknown;
  isSystemSideEffect?: boolean;
};

export const splitEntitiesByResetStrategy = <
  T extends EntityWithApplicationIdentifierAndOverrides,
>({
  metadataName,
  entities,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  metadataName: AllMetadataName;
  entities: T[];
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): {
  toHardDelete: T[];
  toReset: (T & { updatedAt: string })[];
} => {
  const toHardDelete: T[] = [];
  const toReset: (T & { updatedAt: string })[] = [];

  for (const entity of entities) {
    if (
      entity.applicationUniversalIdentifier ===
        workspaceCustomApplicationUniversalIdentifier &&
      !entity.isSystemSideEffect
    ) {
      toHardDelete.push(entity);
    } else {
      toReset.push({
        ...resetAuthoredOverrides({
          metadataName,
          flatEntity: entity,
          authorUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
        updatedAt: now,
      });
    }
  }

  return { toHardDelete, toReset };
};
