export type MockEntityStore<TEntity> = {
  add: (entity: TEntity) => void;
  remove: (entityId: string) => void;
  reset: () => void;
  list: () => TEntity[];
};

export const createMockEntityStore = <TEntity>(
  initialEntities: TEntity[],
  getEntityId: (entity: TEntity) => string,
): MockEntityStore<TEntity> => {
  const seedEntities = [...initialEntities];
  let entities = [...seedEntities];

  return {
    add: (entity) => {
      entities = [...entities, entity];
    },
    remove: (entityId) => {
      entities = entities.filter((entity) => getEntityId(entity) !== entityId);
    },
    reset: () => {
      entities = [...seedEntities];
    },
    list: () => [...entities],
  };
};
