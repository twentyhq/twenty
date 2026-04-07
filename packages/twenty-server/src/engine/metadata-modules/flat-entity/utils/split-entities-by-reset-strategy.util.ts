type EntityWithApplicationIdentifierAndOverrides = {
  applicationUniversalIdentifier: string;
  isActive: boolean;
  overrides: unknown;
};

export const splitEntitiesByResetStrategy = <
  T extends EntityWithApplicationIdentifierAndOverrides,
>({
  entities,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  entities: T[];
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): {
  toHardDelete: T[];
  toReset: (T & { isActive: true; overrides: null; updatedAt: string })[];
} => {
  const toHardDelete: T[] = [];
  const toReset: (T & {
    isActive: true;
    overrides: null;
    updatedAt: string;
  })[] = [];

  for (const entity of entities) {
    if (
      entity.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      toHardDelete.push(entity);
    } else {
      toReset.push({
        ...entity,
        isActive: true as const,
        overrides: null,
        updatedAt: now,
      });
    }
  }

  return { toHardDelete, toReset };
};
