import {
  type DataSource,
  type FindManyOptions,
  type ObjectLiteral,
} from 'typeorm';

import { capitalize, isDefined } from 'twenty-shared/utils';

import { ALL_WORKSPACE_CACHE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/all-workspace-cache-entity-by-name.constant';
import {
  type WorkspaceCacheRowsRequirement,
  type WorkspaceCacheRows,
  type CacheFetchableEntityName,
  type GroupedEntityRowsRequirement,
  type WidenedEntityRowsRequirement,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { groupRowsByForeignKey } from 'src/engine/workspace-cache/utils/group-rows-by-foreign-key.util';
import { isGroupedEntityRowsRequirement } from 'src/engine/workspace-cache/utils/is-grouped-entity-rows-requirement.util';

const normalizeEntityRowsRequirement = (
  entityRowsRequirement: WidenedEntityRowsRequirement,
): GroupedEntityRowsRequirement =>
  isGroupedEntityRowsRequirement(entityRowsRequirement)
    ? entityRowsRequirement
    : { columns: entityRowsRequirement, groupBy: [] };

type EntityFetchGeneration = {
  id: number;
  // null once any requirement asked for full rows
  columns: ReadonlySet<string> | null;
  rowsPromise: Promise<ObjectLiteral[]>;
};

type EntityFetchState = {
  latestGeneration: EntityFetchGeneration;
  settledGenerationId: number;
  settledRows?: ObjectLiteral[];
};

// Scoped to a single recompute batch: the providers' declared rows
// requirements are merged into one deterministic plan (union of column sets
// per entity name, full rows once any provider needs them, always
// withDeleted) and executed as one query per entity before computeForCache
// runs. Loading again with covered requirements is a no-op; uncovered ones
// (a later batch sharing this loader) dispatch a new generation with the
// widened union. Generations are additive: every awaiter records the settled
// rows within its own continuation, so after awaiting a load the rows
// covering it are always readable through readRows, whatever other
// generations are still in flight. Reading an undeclared entity name throws.
export class WorkspaceCacheRowsBatchLoader {
  private readonly fetchStateByEntityName = new Map<
    CacheFetchableEntityName,
    EntityFetchState
  >();

  constructor(
    private readonly coreDataSource: DataSource,
    readonly workspaceId: string,
  ) {}

  async loadRows(rowsRequirements: WorkspaceCacheRowsRequirement[]): Promise<void> {
    const plannedColumnsByEntityName = new Map<
      CacheFetchableEntityName,
      Set<string> | null
    >();

    for (const rowsRequirement of rowsRequirements) {
      for (const [entityName, entityRowsRequirement] of Object.entries(rowsRequirement) as [
        CacheFetchableEntityName,
        WidenedEntityRowsRequirement | undefined,
      ][]) {
        if (!isDefined(entityRowsRequirement)) {
          continue;
        }

        const { columns, groupBy } = normalizeEntityRowsRequirement(entityRowsRequirement);
        const planned = plannedColumnsByEntityName.get(entityName);

        if (columns === true) {
          plannedColumnsByEntityName.set(entityName, null);
          continue;
        }

        if (planned === null) {
          continue;
        }

        // groupBy keys widen the fetch like ordinary columns, so a declared
        // grouping is always backed by fetched data
        const columnsWithGroupByKeys = [...columns, ...groupBy];

        if (!isDefined(planned)) {
          plannedColumnsByEntityName.set(
            entityName,
            new Set(columnsWithGroupByKeys),
          );
          continue;
        }

        for (const column of columnsWithGroupByKeys) {
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

  readRows<TRowsRequirement extends WorkspaceCacheRowsRequirement>(
    rowsRequirement: TRowsRequirement,
  ): WorkspaceCacheRows<TRowsRequirement> {
    const rowsByEntityName: Partial<Record<CacheFetchableEntityName, unknown>> =
      {};

    for (const [entityName, entityRowsRequirement] of Object.entries(rowsRequirement) as [
      CacheFetchableEntityName,
      WidenedEntityRowsRequirement | undefined,
    ][]) {
      if (!isDefined(entityRowsRequirement)) {
        continue;
      }

      const rows = this.getRowsForEntityName(entityName);

      if (!isGroupedEntityRowsRequirement(entityRowsRequirement)) {
        rowsByEntityName[entityName] = rows;
        continue;
      }

      const groupedEntry: Record<string, unknown> = { rows };

      for (const foreignKey of entityRowsRequirement.groupBy) {
        groupedEntry[`by${capitalize(foreignKey)}`] = groupRowsByForeignKey({
          rows,
          foreignKey,
        });
      }

      rowsByEntityName[entityName] = groupedEntry;
    }

    return rowsByEntityName as WorkspaceCacheRows<TRowsRequirement>;
  }

  private getRowsForEntityName(
    entityName: CacheFetchableEntityName,
  ): ObjectLiteral[] {
    const fetchState = this.fetchStateByEntityName.get(entityName);

    if (!isDefined(fetchState) || !isDefined(fetchState.settledRows)) {
      throw new Error(
        `Rows for entity "${entityName}" were not resolved in this recompute batch: declare it in the provider's rowsRequirement`,
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
      .getRepository<ObjectLiteral>(
        ALL_WORKSPACE_CACHE_ENTITY_BY_NAME[entityName],
      )
      .find(findOptions);
  }
}
