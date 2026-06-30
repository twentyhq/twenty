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
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { type WorkspaceScopedEntity } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-entity.type';

// Wraps a TypeORM Repository to scope every operation by workspaceId.
// For workspace-data entities, use WorkspaceRepository instead.
export class WorkspaceScopedRepository<T extends WorkspaceScopedEntity> {
  constructor(private readonly repository: Repository<T>) {}

  findOne(workspaceId: string, options: FindOneOptions<T>): Promise<T | null> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.findOne({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options.where),
    });
  }

  findOneOrFail(workspaceId: string, options: FindOneOptions<T>): Promise<T> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.findOneOrFail({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options.where),
    });
  }

  findOneBy(
    workspaceId: string,
    where: FindOptionsWhere<T>,
  ): Promise<T | null> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.findOneBy(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, where),
    );
  }

  find(workspaceId: string, options?: FindManyOptions<T>): Promise<T[]> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.find({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  count(workspaceId: string, options?: FindManyOptions<T>): Promise<number> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.count({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  findAndCount(
    workspaceId: string,
    options?: FindManyOptions<T>,
  ): Promise<[T[], number]> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.findAndCount({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  exists(workspaceId: string, options?: FindManyOptions<T>): Promise<boolean> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.exists({
      ...options,
      where: this.mergeWorkspaceIdIntoWhere(workspaceId, options?.where),
    });
  }

  existsBy(workspaceId: string, where: FindOptionsWhere<T>): Promise<boolean> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.existsBy(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, where),
    );
  }

  maximum(
    workspaceId: string,
    columnName: string,
    where?: FindOptionsWhere<T>,
  ): Promise<number | null> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.maximum(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columnName as any,
      where
        ? this.mergeWorkspaceIdIntoCriteria(workspaceId, where)
        : ({ workspaceId } as FindOptionsWhere<T>),
    );
  }

  update(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.update(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
      partialEntity,
    );
  }

  increment(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.increment(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
      propertyPath,
      value,
    );
  }

  decrement(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.decrement(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
      propertyPath,
      value,
    );
  }

  delete(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.delete(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
    );
  }

  softDelete(
    workspaceId: string,
    criteria: FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.softDelete(
      this.mergeWorkspaceIdIntoCriteria(workspaceId, criteria),
    );
  }

  // softRemove / recover / remove are intentionally absent.
  // TypeORM's entity-based methods use only the primary key in the WHERE
  // clause — stamping workspaceId on the entity object does not add an
  // AND workspace_id = ? guard to the SQL. A leaked entity id could
  // therefore act on a row from a different workspace.
  // Use softDelete / delete (criteria-based) instead — they always include
  // workspaceId in the WHERE clause.

  insert(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): Promise<InsertResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.insert(
      this.stampWorkspaceIdOnEntities(workspaceId, entity),
    );
  }

  upsert(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<InsertResult> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.upsert(
      this.stampWorkspaceIdOnEntities(workspaceId, entity),
      conflictPathsOrOptions,
    );
  }

  upsertAndReturnOne(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T>,
    conflictPaths: string[],
  ): Promise<T> {
    this.assertWorkspaceId(workspaceId);

    return this.repository
      .upsert(this.stampWorkspaceIdOnEntities(workspaceId, entity), {
        conflictPaths,
        returning: '*',
      })
      .then(({ generatedMaps }) => {
        const [persistedRow] = generatedMaps;

        if (!isDefined(persistedRow)) {
          throw new Error(
            'WorkspaceScopedRepository.upsertAndReturnOne: upsert returned no row.',
          );
        }

        return this.repository.create(persistedRow as DeepPartial<T>);
      });
  }

  save<E extends DeepPartial<T>>(
    workspaceId: string,
    entity: E,
    options?: SaveOptions,
  ): Promise<E & T> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.save({ ...entity, workspaceId } as E, options);
  }

  saveMany<E extends DeepPartial<T>>(
    workspaceId: string,
    entities: E[],
    options?: SaveOptions,
  ): Promise<(E & T)[]> {
    this.assertWorkspaceId(workspaceId);

    return this.repository.save(
      entities.map((entity) => ({ ...entity, workspaceId }) as E),
      options,
    );
  }

  // Escape hatch. Caller MUST add the workspaceId predicate themselves.
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  // Returns a wrapper bound to the given EntityManager (transactions).
  withManager(manager: EntityManager): WorkspaceScopedRepository<T> {
    return new WorkspaceScopedRepository<T>(
      manager.getRepository(this.repository.target),
    );
  }

  // TypeORM drops `undefined` values from WHERE, which would emit an
  // unscoped query. Reject falsy workspaceId at the boundary.
  private assertWorkspaceId(workspaceId: string): void {
    if (
      workspaceId === undefined ||
      workspaceId === null ||
      workspaceId === ''
    ) {
      throw new Error(
        'WorkspaceScopedRepository: workspaceId must be a non-empty string.',
      );
    }
  }

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
    if ('workspaceId' in clause) {
      throw new Error(
        'WorkspaceScopedRepository: do not include `workspaceId` in the WHERE clause — it is provided as the first argument and merged automatically.',
      );
    }

    return { workspaceId, ...clause } as FindOptionsWhere<T>;
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
