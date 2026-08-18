import {
  type DeepPartial,
  type DeleteResult,
  type EntityManager,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  Not,
  type Repository,
  type SelectQueryBuilder,
  type UpdateResult,
} from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { type WorkspaceScopedEntity } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-entity.type';

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

  // save / saveMany / softRemove / recover / remove are intentionally absent.
  // TypeORM's entity-based methods use only the primary key in the WHERE
  // clause, so stamping workspaceId on the entity object does not add an
  // AND workspace_id = ? guard to the SQL. A leaked entity id could act on a
  // row from a different workspace and silently reassign its workspaceId.
  // The criteria-based methods either cannot target an existing row or
  // always carry workspaceId in the WHERE clause.

  insert(workspaceId: string, entity: QueryDeepPartialEntity<T>): Promise<T>;
  insert(
    workspaceId: string,
    entities: QueryDeepPartialEntity<T>[],
  ): Promise<T[]>;
  async insert(
    workspaceId: string,
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): Promise<T | T[]> {
    this.assertWorkspaceId(workspaceId);

    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .values(this.stampWorkspaceIdOnEntities(workspaceId, entityOrEntities))
      .returning('*')
      .execute();

    return this.hydrateReturnedRows(entityOrEntities, raw, 'insert');
  }

  upsert(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T>,
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<T>;
  upsert(
    workspaceId: string,
    entities: QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<T[]>;
  async upsert(
    workspaceId: string,
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<T | T[]> {
    this.assertWorkspaceId(workspaceId);

    await this.assertConflictTargetsBelongToWorkspace(
      workspaceId,
      entityOrEntities,
      conflictPathsOrOptions,
    );

    const options: UpsertOptions<T> = Array.isArray(conflictPathsOrOptions)
      ? { conflictPaths: conflictPathsOrOptions }
      : conflictPathsOrOptions;

    const { raw } = await this.repository.upsert(
      this.stampWorkspaceIdOnEntities(workspaceId, entityOrEntities),
      { ...options, returning: '*' },
    );

    return this.hydrateReturnedRows(entityOrEntities, raw, 'upsert');
  }

  // Escape hatch. Caller MUST add the workspaceId predicate themselves.
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  withManager(manager: EntityManager): WorkspaceScopedRepository<T> {
    return new WorkspaceScopedRepository<T>(
      manager.getRepository(this.repository.target),
    );
  }

  // TypeORM drops `undefined` values from WHERE, which would emit an
  // unscoped query.
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

  // ON CONFLICT matches on the conflict target alone. When that target does
  // not contain workspaceId, a row from another workspace can satisfy it and
  // the DO UPDATE would overwrite that row and reassign its workspaceId.
  private async assertConflictTargetsBelongToWorkspace(
    workspaceId: string,
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<void> {
    const conflictPaths = Array.isArray(conflictPathsOrOptions)
      ? conflictPathsOrOptions
      : (conflictPathsOrOptions.conflictPaths ?? []);

    const conflictPathNames = Array.isArray(conflictPaths)
      ? conflictPaths
      : Object.keys(conflictPaths);

    if (
      conflictPathNames.length === 0 ||
      conflictPathNames.includes('workspaceId')
    ) {
      return;
    }

    const entities = Array.isArray(entity) ? entity : [entity];

    const conflictTargets = entities
      .map((item) =>
        conflictPathNames.reduce<FindOptionsWhere<T>>(
          (target, path) => ({
            ...target,
            [path]: (item as Record<string, unknown>)[path],
          }),
          {} as FindOptionsWhere<T>,
        ),
      )
      .filter((target) =>
        Object.values(target).every((value) => isDefined(value)),
      );

    if (conflictTargets.length === 0) {
      return;
    }

    const foreignRow = await this.repository.findOne({
      where: conflictTargets.map((target) => ({
        ...target,
        workspaceId: Not(workspaceId),
      })),
      withDeleted: true,
    });

    if (isDefined(foreignRow)) {
      throw new Error(
        `WorkspaceScopedRepository: upsert conflict target (${conflictPathNames.join(', ')}) matches a row owned by another workspace.`,
      );
    }
  }

  // RETURNING is the only signal that the statement touched a row. TypeORM
  // still reports a generatedMap per requested entity when it did not, so raw
  // is what distinguishes a suppressed write from a real one.
  private hydrateReturnedRows(
    requested: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    raw: unknown,
    methodName: string,
  ): T | T[] {
    const rows = (Array.isArray(raw) ? raw : []) as DeepPartial<T>[];
    const hydrated = rows.map((row) => this.repository.create(row));

    if (Array.isArray(requested)) {
      return hydrated;
    }

    const [persistedRow] = hydrated;

    if (!isDefined(persistedRow)) {
      throw new Error(
        `WorkspaceScopedRepository.${methodName}: statement returned no row.`,
      );
    }

    return persistedRow;
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
