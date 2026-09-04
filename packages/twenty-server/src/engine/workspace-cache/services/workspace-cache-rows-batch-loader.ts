import {
  type EntityTarget,
  type FindManyOptions,
  type FindOptionsOrder,
  type FindOptionsWhere,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

import { capitalize, isDefined } from 'twenty-shared/utils';

import { ALL_WORKSPACE_CACHE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/all-workspace-cache-entity-by-name.constant';
import {
  WorkspaceCacheException,
  WorkspaceCacheExceptionCode,
} from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import {
  type CacheFetchableEntityName,
  type WidenedEntityRowsRequirement,
  type WorkspaceCacheRows,
  type WorkspaceCacheRowsRequirement,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { groupRowsByForeignKey } from 'src/engine/workspace-cache/utils/group-rows-by-foreign-key.util';
import { isObjectEntityRowsRequirement } from 'src/engine/workspace-cache/utils/is-object-entity-rows-requirement.util';
import { serializeWhereClause } from 'src/engine/workspace-cache/utils/serialize-where-clause.util';

type WhereClause = FindOptionsWhere<ObjectLiteral>;

// Without an ORDER BY, Postgres returns rows in physical (heap) order, which
// changes as rows are updated and is not stable across restarts. Cache
// providers freeze that order into their flat maps, and for the ordered
// collections the array index carries meaning: a view's sort priority is its
// position in `viewSortIds`, so a recompute could silently reorder a
// multi-column sort.
//
// Creation order is the fallback, with `id` as a tiebreaker so equal timestamps
// still resolve deterministically. Every entity in
// ALL_WORKSPACE_CACHE_ENTITY_BY_NAME has both columns.
const DEFAULT_CACHE_ROWS_ORDER = {
  createdAt: 'ASC',
  id: 'ASC',
} as const satisfies FindOptionsOrder<ObjectLiteral>;

// Collections that persist their own user-facing order are read back in that
// order rather than by creation time, so reordering a column survives a cache
// recompute. `viewSort` is deliberately absent: it has no position column, and
// its priority is the creation order the default already gives.
const CACHE_ROWS_ORDER_BY_ENTITY_NAME = {
  viewField: { position: 'ASC', ...DEFAULT_CACHE_ROWS_ORDER },
  viewFieldGroup: { position: 'ASC', ...DEFAULT_CACHE_ROWS_ORDER },
  viewGroup: { position: 'ASC', ...DEFAULT_CACHE_ROWS_ORDER },
  viewFilter: {
    positionInViewFilterGroup: 'ASC',
    ...DEFAULT_CACHE_ROWS_ORDER,
  },
  viewFilterGroup: {
    positionInViewFilterGroup: 'ASC',
    ...DEFAULT_CACHE_ROWS_ORDER,
  },
} as const satisfies Partial<
  Record<CacheFetchableEntityName, FindOptionsOrder<ObjectLiteral>>
>;

const getCacheRowsOrder = (
  entityName: CacheFetchableEntityName,
): FindOptionsOrder<ObjectLiteral> =>
  entityName in CACHE_ROWS_ORDER_BY_ENTITY_NAME
    ? CACHE_ROWS_ORDER_BY_ENTITY_NAME[
        entityName as keyof typeof CACHE_ROWS_ORDER_BY_ENTITY_NAME
      ]
    : DEFAULT_CACHE_ROWS_ORDER;

export type WorkspaceCacheRowsSource = {
  getRepository: (
    entityTarget: EntityTarget<ObjectLiteral>,
  ) => Pick<Repository<ObjectLiteral>, 'find'>;
};

type NormalizedEntityRowsRequirement = {
  columns: readonly string[] | true;
  groupBy: readonly string[];
  where?: WhereClause;
};

const normalizeEntityRowsRequirement = (
  entityRowsRequirement: WidenedEntityRowsRequirement,
): NormalizedEntityRowsRequirement =>
  isObjectEntityRowsRequirement(entityRowsRequirement)
    ? {
        columns: entityRowsRequirement.columns,
        groupBy: entityRowsRequirement.groupBy ?? [],
        where: entityRowsRequirement.where,
      }
    : { columns: entityRowsRequirement, groupBy: [] };

const buildFetchKey = (
  entityName: CacheFetchableEntityName,
  where: WhereClause | undefined,
): string =>
  isDefined(where)
    ? `${entityName}:${serializeWhereClause(where)}`
    : entityName;

type PlannedFetch = {
  entityName: CacheFetchableEntityName;
  where?: WhereClause;
  columns: Set<string> | null;
};

export class WorkspaceCacheRowsBatchLoader {
  private readonly rowsByFetchKey = new Map<string, ObjectLiteral[]>();

  private readonly groupedRowsByFetchKeyAndForeignKey = new Map<
    string,
    Map<string, ObjectLiteral[]>
  >();

  private hasLoadedRows = false;

  constructor(
    private readonly coreDataSource: WorkspaceCacheRowsSource,
    readonly workspaceId: string,
  ) {}

  async loadRows(
    rowsRequirements: WorkspaceCacheRowsRequirement[],
  ): Promise<void> {
    if (this.hasLoadedRows) {
      throw new WorkspaceCacheException(
        'Rows were already loaded for this batch loader: merge all requirements into a single loadRows call',
        WorkspaceCacheExceptionCode.INVALID_PARAMETERS,
      );
    }
    this.hasLoadedRows = true;

    const plannedFetchByFetchKey = new Map<string, PlannedFetch>();

    for (const rowsRequirement of rowsRequirements) {
      for (const [entityName, entityRowsRequirement] of Object.entries(
        rowsRequirement,
      ) as [
        CacheFetchableEntityName,
        WidenedEntityRowsRequirement | undefined,
      ][]) {
        if (!isDefined(entityRowsRequirement)) {
          continue;
        }

        const { columns, groupBy, where } = normalizeEntityRowsRequirement(
          entityRowsRequirement,
        );
        const fetchKey = buildFetchKey(entityName, where);
        const plannedFetch = plannedFetchByFetchKey.get(fetchKey);

        if (columns === true) {
          plannedFetchByFetchKey.set(fetchKey, {
            entityName,
            where,
            columns: null,
          });
          continue;
        }

        const columnsWithGroupByKeys = [...columns, ...groupBy];

        if (!isDefined(plannedFetch)) {
          plannedFetchByFetchKey.set(fetchKey, {
            entityName,
            where,
            columns: new Set(columnsWithGroupByKeys),
          });
          continue;
        }

        if (plannedFetch.columns === null) {
          continue;
        }

        for (const column of columnsWithGroupByKeys) {
          plannedFetch.columns.add(column);
        }
      }
    }

    await Promise.all(
      [...plannedFetchByFetchKey].map(async ([fetchKey, plannedFetch]) => {
        const rows = await this.runFetch(plannedFetch);

        this.rowsByFetchKey.set(fetchKey, rows);
      }),
    );
  }

  readRows<TRowsRequirement extends WorkspaceCacheRowsRequirement>(
    rowsRequirement: TRowsRequirement,
  ): WorkspaceCacheRows<TRowsRequirement> {
    const rowsByEntityName: Partial<Record<CacheFetchableEntityName, unknown>> =
      {};

    for (const [entityName, entityRowsRequirement] of Object.entries(
      rowsRequirement,
    ) as [
      CacheFetchableEntityName,
      WidenedEntityRowsRequirement | undefined,
    ][]) {
      if (!isDefined(entityRowsRequirement)) {
        continue;
      }

      if (!isObjectEntityRowsRequirement(entityRowsRequirement)) {
        rowsByEntityName[entityName] = this.getRowsForFetchKey(
          entityName,
          buildFetchKey(entityName, undefined),
        );
        continue;
      }

      const fetchKey = buildFetchKey(entityName, entityRowsRequirement.where);
      const rows = this.getRowsForFetchKey(entityName, fetchKey);

      if (!isDefined(entityRowsRequirement.groupBy)) {
        rowsByEntityName[entityName] = rows;
        continue;
      }

      const groupedEntry: Record<string, unknown> = { rows };

      for (const foreignKey of entityRowsRequirement.groupBy) {
        groupedEntry[`by${capitalize(foreignKey)}`] = this.getGroupedRows(
          fetchKey,
          foreignKey,
          rows,
        );
      }

      rowsByEntityName[entityName] = groupedEntry;
    }

    return rowsByEntityName as WorkspaceCacheRows<TRowsRequirement>;
  }

  private getGroupedRows(
    fetchKey: string,
    foreignKey: string,
    rows: ObjectLiteral[],
  ): Map<string, ObjectLiteral[]> {
    const memoKey = `${fetchKey}:${foreignKey}`;
    const memoizedGroupedRows =
      this.groupedRowsByFetchKeyAndForeignKey.get(memoKey);

    if (isDefined(memoizedGroupedRows)) {
      return memoizedGroupedRows;
    }

    const groupedRows = groupRowsByForeignKey({ rows, foreignKey });

    this.groupedRowsByFetchKeyAndForeignKey.set(memoKey, groupedRows);

    return groupedRows;
  }

  private getRowsForFetchKey(
    entityName: CacheFetchableEntityName,
    fetchKey: string,
  ): ObjectLiteral[] {
    const rows = this.rowsByFetchKey.get(fetchKey);

    if (!isDefined(rows)) {
      throw new WorkspaceCacheException(
        `Rows for entity "${entityName}" (fetch key "${fetchKey}") were not resolved in this recompute batch: declare it in the provider's rowsRequirement`,
        WorkspaceCacheExceptionCode.INVALID_PARAMETERS,
      );
    }

    return rows;
  }

  private runFetch({
    entityName,
    where,
    columns,
  }: PlannedFetch): Promise<ObjectLiteral[]> {
    const findOptions: FindManyOptions<ObjectLiteral> = {
      where: {
        ...where,
        workspaceId: this.workspaceId,
      },
      withDeleted: true,
      order: getCacheRowsOrder(entityName),
    };

    if (columns !== null) {
      findOptions.select = [...columns];
    }

    return this.coreDataSource
      .getRepository(ALL_WORKSPACE_CACHE_ENTITY_BY_NAME[entityName])
      .find(findOptions);
  }
}
