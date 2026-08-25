import {
  type DataSource,
  type FindManyOptions,
  type ObjectLiteral,
} from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { CACHE_FETCHABLE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/cache-fetchable-entity-by-name.constant';
import {
  type CacheEntityFetchShape,
  type CacheEntityFetchShapeRows,
  type CacheFetchableEntityName,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

type EntityFetchGeneration = {
  id: number;
  // null once any shape asked for full rows
  columns: ReadonlySet<string> | null;
  rowsPromise: Promise<ObjectLiteral[]>;
};

type EntityFetchState = {
  latestGeneration: EntityFetchGeneration;
  settledGenerationId: number;
  settledRows?: ObjectLiteral[];
};

// Scoped to a single recompute batch: the providers' declared fetch shapes
// are merged into one deterministic plan (union of column sets per entity
// name, full rows once any provider needs them, always withDeleted) and
// executed as one query per entity before computeForCache runs. Resolving
// again with covered shapes is a no-op; uncovered ones (a later batch sharing
// this context) dispatch a new generation with the widened union. Generations
// are additive: every awaiter records the settled rows within its own
// continuation, so after awaiting a resolution the rows covering it are
// always readable through getRowsByName, whatever other generations are still
// in flight. Reading an undeclared entity name throws.
export class WorkspaceCacheRecomputeContext {
  private readonly fetchStateByEntityName = new Map<
    CacheFetchableEntityName,
    EntityFetchState
  >();

  constructor(
    private readonly coreDataSource: DataSource,
    readonly workspaceId: string,
  ) {}

  async resolveFetchShapes(shapes: CacheEntityFetchShape[]): Promise<void> {
    const plannedColumnsByEntityName = new Map<
      CacheFetchableEntityName,
      Set<string> | null
    >();

    for (const shape of shapes) {
      for (const [entityName, columns] of Object.entries(shape) as [
        CacheFetchableEntityName,
        readonly string[] | true | undefined,
      ][]) {
        if (!isDefined(columns)) {
          continue;
        }

        const planned = plannedColumnsByEntityName.get(entityName);

        if (columns === true) {
          plannedColumnsByEntityName.set(entityName, null);
          continue;
        }

        if (planned === null) {
          continue;
        }

        if (!isDefined(planned)) {
          plannedColumnsByEntityName.set(entityName, new Set(columns));
          continue;
        }

        for (const column of columns) {
          planned.add(column);
        }
      }
    }

    const generationsToAwait: {
      fetchState: EntityFetchState;
      generation: EntityFetchGeneration;
    }[] = [];

    for (const [entityName, plannedColumns] of plannedColumnsByEntityName) {
      const fetchState = this.fetchStateByEntityName.get(entityName);
      const latestColumns = fetchState?.latestGeneration.columns;

      const isCoveredByLatestGeneration =
        isDefined(fetchState) &&
        (latestColumns === null ||
          (plannedColumns !== null &&
            [...plannedColumns].every((column) => latestColumns!.has(column))));

      if (isCoveredByLatestGeneration) {
        generationsToAwait.push({
          fetchState,
          generation: fetchState.latestGeneration,
        });
        continue;
      }

      let mergedColumns: Set<string> | null;

      if (!isDefined(fetchState)) {
        mergedColumns = plannedColumns;
      } else if (plannedColumns === null || latestColumns === null) {
        mergedColumns = null;
      } else {
        mergedColumns = new Set([...latestColumns!, ...plannedColumns]);
      }

      const generation: EntityFetchGeneration = {
        id: isDefined(fetchState) ? fetchState.latestGeneration.id + 1 : 1,
        columns: mergedColumns,
        rowsPromise: this.runFetch(entityName, mergedColumns),
      };

      if (isDefined(fetchState)) {
        fetchState.latestGeneration = generation;
        generationsToAwait.push({ fetchState, generation });
      } else {
        const newFetchState: EntityFetchState = {
          latestGeneration: generation,
          settledGenerationId: 0,
        };

        this.fetchStateByEntityName.set(entityName, newFetchState);
        generationsToAwait.push({ fetchState: newFetchState, generation });
      }
    }

    await Promise.all(
      generationsToAwait.map(async ({ fetchState, generation }) => {
        const rows = await generation.rowsPromise;

        // A newer generation always fetches a superset of columns, so only
        // move the settled pointer forward.
        if (generation.id > fetchState.settledGenerationId) {
          fetchState.settledGenerationId = generation.id;
          fetchState.settledRows = rows;
        }
      }),
    );
  }

  getRowsByName<TShape extends CacheEntityFetchShape>(
    shape: TShape,
  ): CacheEntityFetchShapeRows<TShape> {
    const rowsByEntityName: Partial<
      Record<CacheFetchableEntityName, ObjectLiteral[]>
    > = {};

    for (const entityName of Object.keys(shape) as CacheFetchableEntityName[]) {
      rowsByEntityName[entityName] = this.getRowsForEntityName(entityName);
    }

    return rowsByEntityName as CacheEntityFetchShapeRows<TShape>;
  }

  private getRowsForEntityName(
    entityName: CacheFetchableEntityName,
  ): ObjectLiteral[] {
    const fetchState = this.fetchStateByEntityName.get(entityName);

    if (!isDefined(fetchState) || !isDefined(fetchState.settledRows)) {
      throw new Error(
        `Rows for entity "${entityName}" were not resolved in this recompute batch: declare it in the provider's fetchRequirements`,
      );
    }

    return fetchState.settledRows;
  }

  private runFetch(
    entityName: CacheFetchableEntityName,
    columns: ReadonlySet<string> | null,
  ): Promise<ObjectLiteral[]> {
    const findOptions: FindManyOptions<ObjectLiteral> = {
      where: {
        workspaceId: this.workspaceId,
      },
      withDeleted: true,
    };

    if (columns !== null) {
      findOptions.select = [...columns];
    }

    return this.coreDataSource
      .getRepository<ObjectLiteral>(CACHE_FETCHABLE_ENTITY_BY_NAME[entityName])
      .find(findOptions);
  }
}
