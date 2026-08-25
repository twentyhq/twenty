import {
  type DataSource,
  type EntityTarget,
  type FindManyOptions,
} from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import {
  type EntityFetchRequirement,
  type WorkspaceScopedRow,
} from 'src/engine/workspace-cache/types/entity-fetch-requirement.type';

type EntityFetchGeneration = {
  id: number;
  // null once any requirement asked for full rows
  columns: ReadonlySet<string> | null;
  rowsPromise: Promise<WorkspaceScopedRow[]>;
};

type EntityFetchState = {
  entityTarget: EntityTarget<WorkspaceScopedRow>;
  latestGeneration: EntityFetchGeneration;
  settledGenerationId: number;
  settledRows?: WorkspaceScopedRow[];
};

// Scoped to a single recompute batch: the providers' declared fetch
// requirements are merged into one deterministic plan (union of column sets
// per entity, full rows once any provider needs them, always withDeleted) and
// executed as one query per entity before computeForCache runs. Resolving
// again with covered requirements is a no-op; uncovered ones (a later batch
// sharing this context) dispatch a new generation with the widened union.
// Generations are additive: every awaiter records the
// settled rows within its own continuation, so after awaiting a resolution
// the rows covering it are always readable through getRows, whatever other
// generations are still in flight. Reading an undeclared entity throws.
export class WorkspaceCacheRecomputeContext {
  private readonly fetchStateByEntityName = new Map<string, EntityFetchState>();

  constructor(
    private readonly coreDataSource: DataSource,
    private readonly workspaceId: string,
  ) {}

  async resolveFetchRequirements(
    requirements: EntityFetchRequirement[],
  ): Promise<void> {
    await this.resolveToRowsByEntityName(requirements);
  }

  getRows<TEntity extends WorkspaceScopedRow>(
    entityTarget: EntityTarget<TEntity>,
  ): TEntity[] {
    const entityName = this.getEntityName(entityTarget);
    const fetchState = this.fetchStateByEntityName.get(entityName);

    if (!isDefined(fetchState) || !isDefined(fetchState.settledRows)) {
      throw new Error(
        `Rows for entity "${entityName}" were not resolved in this recompute batch: declare it in the provider's fetchRequirements`,
      );
    }

    return fetchState.settledRows as TEntity[];
  }

  private async resolveToRowsByEntityName(
    requirements: EntityFetchRequirement[],
  ): Promise<Map<string, WorkspaceScopedRow[]>> {
    const plannedByEntityName = new Map<
      string,
      {
        entityTarget: EntityTarget<WorkspaceScopedRow>;
        columns: Set<string> | null;
      }
    >();

    for (const { entityTarget, columns } of requirements) {
      const entityName = this.getEntityName(entityTarget);
      const planned = plannedByEntityName.get(entityName);

      if (!isDefined(planned)) {
        plannedByEntityName.set(entityName, {
          entityTarget,
          columns: isDefined(columns) ? new Set(columns) : null,
        });
        continue;
      }

      if (!isDefined(columns)) {
        planned.columns = null;
      } else if (planned.columns !== null) {
        for (const column of columns) {
          planned.columns.add(column);
        }
      }
    }

    const generationsToAwait: {
      entityName: string;
      fetchState: EntityFetchState;
      generation: EntityFetchGeneration;
    }[] = [];

    for (const [entityName, planned] of plannedByEntityName) {
      const fetchState = this.fetchStateByEntityName.get(entityName);
      const latestColumns = fetchState?.latestGeneration.columns;

      const isCoveredByLatestGeneration =
        isDefined(fetchState) &&
        (latestColumns === null ||
          (planned.columns !== null &&
            [...planned.columns].every((column) =>
              latestColumns!.has(column),
            )));

      if (isCoveredByLatestGeneration) {
        generationsToAwait.push({
          entityName,
          fetchState,
          generation: fetchState.latestGeneration,
        });
        continue;
      }

      let mergedColumns: Set<string> | null;

      if (!isDefined(fetchState)) {
        mergedColumns = planned.columns;
      } else if (planned.columns === null || latestColumns === null) {
        mergedColumns = null;
      } else {
        mergedColumns = new Set([...latestColumns!, ...planned.columns]);
      }

      const generation: EntityFetchGeneration = {
        id: isDefined(fetchState) ? fetchState.latestGeneration.id + 1 : 1,
        columns: mergedColumns,
        rowsPromise: this.runFetch(planned.entityTarget, mergedColumns),
      };

      if (isDefined(fetchState)) {
        fetchState.latestGeneration = generation;
        generationsToAwait.push({ entityName, fetchState, generation });
      } else {
        const newFetchState: EntityFetchState = {
          entityTarget: planned.entityTarget,
          latestGeneration: generation,
          settledGenerationId: 0,
        };

        this.fetchStateByEntityName.set(entityName, newFetchState);
        generationsToAwait.push({
          entityName,
          fetchState: newFetchState,
          generation,
        });
      }
    }

    const rowsByEntityName = new Map<string, WorkspaceScopedRow[]>();

    await Promise.all(
      generationsToAwait.map(async ({ entityName, fetchState, generation }) => {
        const rows = await generation.rowsPromise;

        // A newer generation always fetches a superset of columns, so only
        // move the settled pointer forward.
        if (generation.id > fetchState.settledGenerationId) {
          fetchState.settledGenerationId = generation.id;
          fetchState.settledRows = rows;
        }

        rowsByEntityName.set(entityName, rows);
      }),
    );

    return rowsByEntityName;
  }

  private getEntityName(
    entityTarget: EntityTarget<WorkspaceScopedRow>,
  ): string {
    return this.coreDataSource.getRepository(entityTarget).metadata.name;
  }

  private runFetch(
    entityTarget: EntityTarget<WorkspaceScopedRow>,
    columns: ReadonlySet<string> | null,
  ): Promise<WorkspaceScopedRow[]> {
    const findOptions: FindManyOptions<WorkspaceScopedRow> = {
      where: {
        workspaceId: this.workspaceId,
      },
      withDeleted: true,
    };

    if (columns !== null) {
      findOptions.select = [
        ...columns,
      ] as FindManyOptions<WorkspaceScopedRow>['select'];
    }

    return this.coreDataSource.getRepository(entityTarget).find(findOptions);
  }
}
