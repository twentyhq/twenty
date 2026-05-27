import {
  type DeepPartial,
  type DeleteResult,
  type EntityManager,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  type InsertResult,
  type Repository,
  type SaveOptions,
  type SelectQueryBuilder,
  type UpdateResult,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { type WorkspaceScopedEntity } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-entity.type';

// Wraps a TypeORM Repository so every operation is scoped to a
// caller-supplied workspaceId. Makes cross-workspace IDOR bugs
// impossible-by-default for core- and metadata-schema entities that
// carry a workspaceId column. Workspace-data schema entities continue
// to use WorkspaceRepository / twentyORMManager.
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
  // (joins, aggregates, complex predicates). Caller MUST add the
  // workspaceId predicate themselves — this method does not enforce it.
  // Prefer the typed methods above when possible.
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  // Returns a new wrapper bound to the given EntityManager. Use inside
  // a QueryRunner transaction so reads/writes participate in the
  // transaction while still being workspace-scoped.
  withManager(manager: EntityManager): WorkspaceScopedRepository<T> {
    return new WorkspaceScopedRepository<T>(
      manager.getRepository(this.repository.target),
    );
  }

  // workspaceId goes first in the merged object so it appears first in
  // the generated SQL WHERE clause. Postgres' planner picks the most
  // selective index regardless of clause order, but leading with
  // workspaceId matches how the composite indexes are declared on these
  // tables and makes the security intent obvious in query logs. We
  // strip any caller-supplied workspaceId first so the scoped value
  // always wins.
  private mergeWorkspaceIdIntoWhere(
    workspaceId: string,
    where: FindOneOptions<T>['where'] | undefined,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    if (where === undefined) {
      return { workspaceId } as FindOptionsWhere<T>;
    }

    if (Array.isArray(where)) {
      return where.map((clause) =>
        this.prependWorkspaceId(workspaceId, clause),
      );
    }

    return this.prependWorkspaceId(workspaceId, where as FindOptionsWhere<T>);
  }

  private mergeWorkspaceIdIntoCriteria(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): FindOptionsWhere<T> {
    return this.prependWorkspaceId(workspaceId, criteria);
  }

  private prependWorkspaceId(
    workspaceId: string,
    clause: FindOptionsWhere<T>,
  ): FindOptionsWhere<T> {
    const { workspaceId: _ignored, ...rest } = clause as FindOptionsWhere<T> & {
      workspaceId?: unknown;
    };

    return { workspaceId, ...rest } as FindOptionsWhere<T>;
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
