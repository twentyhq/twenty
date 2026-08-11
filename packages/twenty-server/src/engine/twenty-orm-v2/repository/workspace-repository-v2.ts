import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-record-filter.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

type WorkspaceRepositoryV2Options = {
  tableShape: WorkspaceTableShape;
  flatObjectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  executor: QueryExecutorV2;
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  flatObjectMetadataByObjectMetadataId: (
    objectMetadataId: string,
  ) => FlatObjectMetadata;
};

export class WorkspaceRepositoryV2 {
  readonly objectRecordsPermissions: ObjectsPermissions;

  private readonly options: WorkspaceRepositoryV2Options;

  constructor(options: WorkspaceRepositoryV2Options) {
    this.options = options;
    this.objectRecordsPermissions = options.objectRecordsPermissions;
  }

  createQueryBuilder(alias?: string): WorkspaceSelectQueryBuilderV2 {
    return new WorkspaceSelectQueryBuilderV2(
      alias ?? this.options.tableShape.nameSingular,
      {
        tableShape: this.options.tableShape,
        executor: this.options.executor,
        objectRecordsPermissions: this.options.objectRecordsPermissions,
        tableShapeByObjectMetadataId: this.options.tableShapeByObjectMetadataId,
        onBeforeExecute: (queryBuilder) => this.onBeforeExecute(queryBuilder),
        formatResult: (records) => this.formatResult(records),
      },
    );
  }

  formatResult<T>(records: unknown): T {
    return formatResult<T>(
      records,
      this.options.flatObjectMetadata,
      this.options.internalContext.flatObjectMetadataMaps,
      this.options.internalContext.flatFieldMetadataMaps,
    );
  }

  private onBeforeExecute(queryBuilder: WorkspaceSelectQueryBuilderV2): void {
    this.applyRowLevelPermissionPredicates(queryBuilder);
    this.validateQueryIsPermitted(queryBuilder);
  }

  private validateQueryIsPermitted(
    queryBuilder: WorkspaceSelectQueryBuilderV2,
  ): void {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    for (const [alias, columnNames] of Object.entries(columnNamesByAlias)) {
      const nameSingular =
        alias === queryBuilder.alias
          ? this.options.tableShape.nameSingular
          : queryBuilder.getJoinedTableShape(alias)?.nameSingular;

      if (!isDefined(nameSingular)) {
        continue;
      }

      validateOperationIsPermittedOrThrow({
        entityName: nameSingular,
        operationType: 'select',
        objectsPermissions: this.options.objectRecordsPermissions,
        flatObjectMetadataMaps:
          this.options.internalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps:
          this.options.internalContext.flatFieldMetadataMaps,
        objectIdByNameSingular:
          this.options.internalContext.objectIdByNameSingular,
        selectedColumns: columnNames,
        allFieldsSelected: false,
        updatedColumns: [],
      });
    }
  }

  private applyRowLevelPermissionPredicates(
    queryBuilder: WorkspaceSelectQueryBuilderV2,
  ): void {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    this.applyRowLevelPermissionPredicateForAlias({
      queryBuilder,
      alias: queryBuilder.alias,
      flatObjectMetadata: this.options.flatObjectMetadata,
    });

    for (const joinAttribute of queryBuilder.expressionMap.joinAttributes) {
      const joinedTableShape = queryBuilder.getJoinedTableShape(
        joinAttribute.alias.name,
      );

      if (!isDefined(joinedTableShape)) {
        continue;
      }

      this.applyRowLevelPermissionPredicateForAlias({
        queryBuilder,
        alias: joinAttribute.alias.name,
        flatObjectMetadata: this.options.flatObjectMetadataByObjectMetadataId(
          joinedTableShape.objectMetadataId,
        ),
      });
    }
  }

  private applyRowLevelPermissionPredicateForAlias({
    queryBuilder,
    alias,
    flatObjectMetadata,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilderV2;
    alias: string;
    flatObjectMetadata: FlatObjectMetadata;
  }): void {
    if (!queryBuilder.markRowLevelPermissionApplied(alias)) {
      return;
    }

    const recordFilter = resolveRowLevelPermissionRecordFilter({
      internalContext: this.options.internalContext,
      authContext: this.options.authContext,
      objectMetadata: flatObjectMetadata,
    });

    if (!isDefined(recordFilter)) {
      return;
    }

    const renderedCondition = renderRowLevelPermissionFilterToSql({
      recordFilter,
      tableAlias: alias,
      objectMetadata: flatObjectMetadata,
      flatFieldMetadataMaps: this.options.internalContext.flatFieldMetadataMaps,
    });

    if (!isDefined(renderedCondition)) {
      return;
    }

    if (alias === queryBuilder.alias) {
      queryBuilder.andWhere(
        renderedCondition.sql,
        renderedCondition.parameters,
      );

      return;
    }

    // In WHERE this would turn the LEFT JOIN into an inner join.
    queryBuilder.addJoinCondition(alias, renderedCondition.sql);
    queryBuilder.setParameters(renderedCondition.parameters);
  }
}
