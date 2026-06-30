import { type Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { type Repository } from 'typeorm';

import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { type WorkspaceScopedEntity } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-entity.type';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Requires TypeOrmModule.forFeature([entity]) in the same module.
export const provideWorkspaceScopedRepository = (
  entity: EntityClassOrSchema,
): Provider => ({
  provide: getWorkspaceScopedRepositoryToken(entity),
  useFactory: <T extends WorkspaceScopedEntity>(repository: Repository<T>) =>
    new WorkspaceScopedRepository<T>(repository),
  inject: [getRepositoryToken(entity)],
});
