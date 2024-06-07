import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { EntitySchema, Repository } from 'typeorm';

export function getWorkspaceRepositoryToken(
  entity: EntityClassOrSchema,
  // eslint-disable-next-line @typescript-eslint/ban-types
): Function | string {
  if (entity === null || entity === undefined) {
    throw new Error('Circular dependency @InjectWorkspaceRepository()');
  }

  if (entity instanceof Function && entity.prototype instanceof Repository) {
    return entity;
  }

  if (entity instanceof EntitySchema) {
    return `${
      entity.options.target ? entity.options.target.name : entity.options.name
    }WorkspaceRepository`;
  }

  return `${entity.name}WorkspaceRepository`;
}
