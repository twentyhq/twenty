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

export class WorkspaceCacheRowsBatchLoader {
  private readonly rowsByEntityName = new Map<
    CacheFetchableEntityName,
    ObjectLiteral[]
  >();

  private hasLoadedRows = false;

  constructor(
    private readonly coreDataSource: DataSource,
    readonly workspaceId: string,
  ) {}

  async loadRows(
    rowsRequirements: WorkspaceCacheRowsRequirement[],
  ): Promise<void> {
    if (this.hasLoadedRows) {
      throw new Error(
        'Rows were already loaded for this batch loader: merge all requirements into a single loadRows call',
      );
    }
    this.hasLoadedRows = true;

    const plannedColumnsByEntityName = new Map<
      CacheFetchableEntityName,
      Set<string> | null
    >();

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

        const { columns, groupBy } = normalizeEntityRowsRequirement(
          entityRowsRequirement,
        );
        const planned = plannedColumnsByEntityName.get(entityName);

        if (columns === true) {
          plannedColumnsByEntityName.set(entityName, null);
          continue;
        }

        if (planned === null) {
          continue;
        }

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

    await Promise.all(
      [...plannedColumnsByEntityName].map(
        async ([entityName, plannedColumns]) => {
          const rows = await this.runFetch(entityName, plannedColumns);

          this.rowsByEntityName.set(entityName, rows);
        },
      ),
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
    const rows = this.rowsByEntityName.get(entityName);

    if (!isDefined(rows)) {
      throw new Error(
        `Rows for entity "${entityName}" were not resolved in this recompute batch: declare it in the provider's rowsRequirement`,
      );
    }

    return rows;
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
