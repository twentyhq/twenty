import {
  type DataSource,
  type EntityTarget,
  type FindManyOptions,
  type ObjectLiteral,
} from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

type WorkspaceScopedRow = ObjectLiteral & { workspaceId: string };

type PendingEntityFetch = {
  entityTarget: EntityTarget<WorkspaceScopedRow>;
  // null once any caller asked for full rows
  selectColumns: Set<string> | null;
  isDispatched: boolean;
  rowsPromise: Promise<WorkspaceScopedRow[]>;
  resolveRows: (rows: WorkspaceScopedRow[]) => void;
  rejectRows: (error: unknown) => void;
};

// Scoped to a single recompute batch: providers recomputed together share one
// fetch per entity instead of each re-querying the tables they have in common.
// Providers declare the columns they read; requests registered during the
// batch's synchronous phase are coalesced and dispatched on the next microtask
// with the union of the declared column sets (full rows once any caller needs
// them, always withDeleted). A provider recomputed alone therefore fetches
// exactly what it declared, while batched providers share the unioned fetch.
export class WorkspaceCacheRecomputeContext {
  private readonly pendingFetchByEntityName = new Map<
    string,
    PendingEntityFetch
  >();

  constructor(
    private readonly coreDataSource: DataSource,
    private readonly workspaceId: string,
  ) {}

  findAll<TEntity extends WorkspaceScopedRow>(
    entityTarget: EntityTarget<TEntity>,
    selectColumns?: readonly (keyof TEntity & string)[],
  ): Promise<TEntity[]> {
    const entityName =
      this.coreDataSource.getRepository(entityTarget).metadata.name;
    const pendingFetch = this.pendingFetchByEntityName.get(entityName);

    if (!isDefined(pendingFetch)) {
      return this.registerFetch(entityName, entityTarget, selectColumns);
    }

    if (!pendingFetch.isDispatched) {
      if (!isDefined(selectColumns)) {
        pendingFetch.selectColumns = null;
      } else if (pendingFetch.selectColumns !== null) {
        for (const column of selectColumns) {
          pendingFetch.selectColumns.add(column);
        }
      }

      return pendingFetch.rowsPromise as Promise<TEntity[]>;
    }

    const isCoveredByDispatchedFetch =
      pendingFetch.selectColumns === null ||
      (isDefined(selectColumns) &&
        selectColumns.every((column) =>
          pendingFetch.selectColumns!.has(column),
        ));

    if (isCoveredByDispatchedFetch) {
      return pendingFetch.rowsPromise as Promise<TEntity[]>;
    }

    // Late request needing columns the dispatched fetch did not include: run
    // it standalone rather than blocking on a second coalescing round.
    return this.runFetch(entityTarget, selectColumns);
  }

  private registerFetch<TEntity extends WorkspaceScopedRow>(
    entityName: string,
    entityTarget: EntityTarget<TEntity>,
    selectColumns?: readonly (keyof TEntity & string)[],
  ): Promise<TEntity[]> {
    let resolveRows!: PendingEntityFetch['resolveRows'];
    let rejectRows!: PendingEntityFetch['rejectRows'];
    const rowsPromise = new Promise<WorkspaceScopedRow[]>((resolve, reject) => {
      resolveRows = resolve;
      rejectRows = reject;
    });

    const pendingFetch: PendingEntityFetch = {
      entityTarget,
      selectColumns: isDefined(selectColumns)
        ? new Set<string>(selectColumns)
        : null,
      isDispatched: false,
      rowsPromise,
      resolveRows,
      rejectRows,
    };

    this.pendingFetchByEntityName.set(entityName, pendingFetch);

    // Native promise microtask rather than queueMicrotask/process.nextTick:
    // those globals are faked by jest's globally-enabled fake timers, which
    // would deadlock any provider test awaiting a findAll.
    void Promise.resolve().then(() => {
      pendingFetch.isDispatched = true;

      this.runFetch(
        pendingFetch.entityTarget,
        pendingFetch.selectColumns === null
          ? undefined
          : [...pendingFetch.selectColumns],
      ).then(pendingFetch.resolveRows, pendingFetch.rejectRows);
    });

    return rowsPromise as Promise<TEntity[]>;
  }

  private runFetch<TEntity extends WorkspaceScopedRow>(
    entityTarget: EntityTarget<TEntity>,
    selectColumns?: readonly string[],
  ): Promise<TEntity[]> {
    const findOptions: FindManyOptions<TEntity> = {
      where: {
        workspaceId: this.workspaceId,
      } as FindManyOptions<TEntity>['where'],
      withDeleted: true,
    };

    if (isDefined(selectColumns)) {
      findOptions.select = [
        ...selectColumns,
      ] as FindManyOptions<TEntity>['select'];
    }

    return this.coreDataSource.getRepository(entityTarget).find(findOptions);
  }
}
