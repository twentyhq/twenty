import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

const getEntityName = (entity: EntityClassOrSchema): string => {
  if (typeof entity === 'function') {
    return entity.name;
  }

  return entity.options?.name ?? entity.constructor.name;
};

export const getWorkspaceScopedRepositoryToken = (
  entity: EntityClassOrSchema,
): string => `WorkspaceScopedRepository<${getEntityName(entity)}>`;
