type EntityWithSystemSideEffectAndOverrides = {
  isSystemSideEffect: boolean;
  isActive: boolean;
  overrides: unknown;
};

export const splitEntitiesByResetStrategy = <
  T extends EntityWithSystemSideEffectAndOverrides,
>({
  entities,
  now,
}: {
  entities: T[];
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
    if (entity.isSystemSideEffect) {
      toReset.push({
        ...entity,
        isActive: true as const,
        overrides: null,
        ...('universalOverrides' in entity ? { universalOverrides: null } : {}),
        updatedAt: now,
      });
    } else {
      toHardDelete.push(entity);
    }
  }

  return { toHardDelete, toReset };
};
