type EntityWithApplicationIdentifier = {
  applicationUniversalIdentifier: string;
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
  toDeactivate: (T & { isActive: false; updatedAt: string })[];
} => {
  const toHardDelete: T[] = [];
  const toDeactivate: (T & { isActive: false; updatedAt: string })[] = [];

  for (const entity of entitiesToRemove) {
    if (
      entity.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      toHardDelete.push(entity);
    } else {
      toDeactivate.push({
        ...entity,
        isActive: false as const,
        updatedAt: now,
      });
    }
  }

  return { toHardDelete, toDeactivate };
};
