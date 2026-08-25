import {
  type DataSource,
  type EntityTarget,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

type WorkspaceScopedRow = ObjectLiteral & { workspaceId: string };

// Scoped to a single recompute batch: providers recomputed together share one
// fetch per entity instead of each re-querying the tables they have in common.
// The fetch shape is canonical (all workspace rows, withDeleted, no relations)
// so one query serves every provider's projection; callers narrow in memory.
export class WorkspaceCacheRecomputeContext {
  private readonly rowsPromiseByEntityName = new Map<
    string,
    Promise<WorkspaceScopedRow[]>
  >();

  constructor(
    private readonly coreDataSource: DataSource,
    private readonly workspaceId: string,
  ) {}

  findAll<TEntity extends WorkspaceScopedRow>(
    entityTarget: EntityTarget<TEntity>,
  ): Promise<TEntity[]> {
    const repository = this.coreDataSource.getRepository(entityTarget);
    const entityName = repository.metadata.name;

    const memoizedRowsPromise = this.rowsPromiseByEntityName.get(entityName);

    if (isDefined(memoizedRowsPromise)) {
      return memoizedRowsPromise as Promise<TEntity[]>;
    }

    const rowsPromise = repository.find({
      where: { workspaceId: this.workspaceId } as FindOptionsWhere<TEntity>,
      withDeleted: true,
    });

    this.rowsPromiseByEntityName.set(entityName, rowsPromise);

    return rowsPromise;
  }
}
