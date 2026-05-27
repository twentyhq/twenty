import { Inject, type Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {
  type DeepPartial,
  type DeleteResult,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  type InsertResult,
  type ObjectLiteral,
  type Repository,
  type SaveOptions,
  type SelectQueryBuilder,
  type UpdateResult,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type UpsertOptions } from 'typeorm/repository/UpsertOptions';

// Entities accessed through this wrapper must declare a workspaceId column.
// The constraint is enforced both at compile time (the generic bound below)
// and at runtime (every read/write merges workspaceId into the criteria).
export type WorkspaceScopedEntity = ObjectLiteral & { workspaceId: string };

// Wraps a TypeORM Repository so that every operation is scoped to a
// caller-supplied workspaceId. Built to make cross-workspace IDOR bugs
// impossible-by-default for `core` and `metadata` schema entities that
// carry a workspaceId column. Workspace-data schema entities should keep
// using WorkspaceRepository / twentyORMManager.
export class WorkspaceScopedRepository<T extends WorkspaceScopedEntity> {
  constructor(private readonly repository: Repository<T>) {}

  findOne(workspaceId: string, options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options.where),
    });
  }

  findOneOrFail(workspaceId: string, options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOneOrFail({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options.where),
    });
  }

  find(workspaceId: string, options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  count(workspaceId: string, options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  update(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.repository.update(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
      partialEntity,
    );
  }

  delete(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return this.repository.delete(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
    );
  }

  softDelete(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    return this.repository.softDelete(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
    );
  }

  insert(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): Promise<InsertResult> {
    return this.repository.insert(
      this.stampWorkspaceIdOnEntities(workspaceId, entity),
    );
  }

  upsert(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<InsertResult> {
    return this.repository.upsert(
      this.stampWorkspaceIdOnEntities(workspaceId, entity),
      conflictPathsOrOptions,
    );
  }

  save<E extends DeepPartial<T>>(
    workspaceId: string,
    entity: E,
    options?: SaveOptions,
  ): Promise<E & T> {
    return this.repository.save({ ...entity, workspaceId } as E, options);
  }

  saveMany<E extends DeepPartial<T>>(
    workspaceId: string,
    entities: E[],
    options?: SaveOptions,
  ): Promise<(E & T)[]> {
    return this.repository.save(
      entities.map((entity) => ({ ...entity, workspaceId }) as E),
      options,
    );
  }

  // Escape hatch for cases that genuinely need a SelectQueryBuilder
  // (joins, aggregates, complex predicates). Caller MUST add the workspaceId
  // predicate themselves — this method does not enforce it. Prefer the
  // typed methods above when possible.
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  private mergeWorkspaceIdIntoWhere(
    workspaceId: string,
    where: FindOneOptions<T>['where'] | undefined,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    if (where === undefined) {
      return { workspaceId } as FindOptionsWhere<T>;
    }

    if (Array.isArray(where)) {
      return where.map(
        (clause) => ({ ...clause, workspaceId }) as FindOptionsWhere<T>,
      );
    }

    return { ...where, workspaceId } as FindOptionsWhere<T>;
  }

  private mergeWorkspaceIdIntoCriteria(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): FindOptionsWhere<T> {
    return { ...criteria, workspaceId } as FindOptionsWhere<T>;
  }

  private stampWorkspaceIdOnEntities(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[] {
    if (Array.isArray(entity)) {
      return entity.map(
        (item) => ({ ...item, workspaceId }) as QueryDeepPartialEntity<T>,
      );
    }

    return { ...entity, workspaceId } as QueryDeepPartialEntity<T>;
  }
}

const tokenFor = (entity: EntityClassOrSchema): string =>
  `WorkspaceScopedRepository<${getEntityName(entity)}>`;

const getEntityName = (entity: EntityClassOrSchema): string => {
  if (typeof entity === 'function') {
    return entity.name;
  }

  return entity.options?.name ?? entity.constructor.name;
};

// Use inside Nest module `providers:` arrays. Wires up a
// WorkspaceScopedRepository<T> for the given entity by reading the
// raw TypeORM repository provided by TypeOrmModule.forFeature([entity]).
export const provideWorkspaceScopedRepository = (
  entity: EntityClassOrSchema,
): Provider => ({
  provide: tokenFor(entity),
  useFactory: <T extends WorkspaceScopedEntity>(repository: Repository<T>) =>
    new WorkspaceScopedRepository<T>(repository),
  inject: [getRepositoryToken(entity)],
});

// Parameter decorator for constructor injection.
export const InjectWorkspaceScopedRepository = (
  entity: EntityClassOrSchema,
): ParameterDecorator => Inject(tokenFor(entity));

// Exposed for tests that need to provide a mock against the same token
// the application code resolves to.
export const getWorkspaceScopedRepositoryToken = tokenFor;
