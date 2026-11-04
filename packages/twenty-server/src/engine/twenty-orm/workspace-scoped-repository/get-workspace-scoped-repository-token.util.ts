import { type EntityClassOrSchema } from 'src/engine/twenty-orm/types/entity-class-or-schema.type';

const getEntityName = (entity: EntityClassOrSchema): string => {
  if (typeof entity === 'function') {
    return entity.name;
  }

  return entity.options?.name ?? entity.constructor.name;
};

export const getWorkspaceScopedRepositoryToken = (
  entity: EntityClassOrSchema,
): string => `WorkspaceScopedRepository<${getEntityName(entity)}>`;
