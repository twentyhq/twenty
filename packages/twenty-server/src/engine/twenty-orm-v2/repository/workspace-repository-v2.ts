import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-record-filter.util';
import { validateRLSPredicatesForRecords } from 'src/engine/twenty-orm/utils/validate-rls-predicates-for-records.util';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';
import {
  buildInsertStatement,
  type InsertRowValue,
} from 'src/engine/twenty-orm-v2/sql/utils/build-insert-statement.util';
import { type MutationKind } from 'src/engine/twenty-orm-v2/sql/utils/build-mutation-statement.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const MUTATION_EVENT_ACTIONS_BY_KIND: Record<
  MutationKind,
  DatabaseEventAction[]
> = {
  delete: [DatabaseEventAction.DESTROYED],
  restore: [DatabaseEventAction.RESTORED],
  'soft-delete': [DatabaseEventAction.DELETED],
  update: [DatabaseEventAction.UPDATED, DatabaseEventAction.UPSERTED],
};

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

  async executeRaw<T extends Record<string, unknown>>(
    sql: string,
    parameters: Record<string, unknown>,
  ): Promise<T[]> {
    const compiled = compileNamedParameters(sql, parameters);

    return this.options.executor.execute(compiled) as Promise<T[]>;
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

  applyWriteRowLevelPermissions(
    queryBuilder: WorkspaceSelectQueryBuilderV2,
  ): void {
    this.applyRowLevelPermissionPredicates(queryBuilder);
  }

  getInternalContext(): WorkspaceInternalContext {
    return this.options.internalContext;
  }

  async runInsert({
    records,
    columnsToReturn,
  }: {
    records: Partial<ObjectRecord>[];
    columnsToReturn: string[];
  }): Promise<{
    identifiers: { id: string }[];
    generatedMaps: ObjectRecord[];
    raw: ObjectRecord[];
  }> {
    const { columnNames, rows, parameters, insertedColumns, formattedRecords } =
      this.buildInsertRows(records);

    this.validateWriteIsPermitted({
      operationType: 'insert',
      columnsToReturn,
      updatedColumns: insertedColumns,
    });

    this.validateRLSPredicatesForWrittenRecords(
      this.formatResult<ObjectRecord[]>(formattedRecords),
    );

    const sql = buildInsertStatement({
      tableShape: this.options.tableShape,
      columnNames,
      rows,
      returningColumns: columnsToReturn,
    });

    const rawRows = await this.executeRaw<ObjectRecord>(sql, parameters);

    const generatedMaps = this.formatResult<ObjectRecord[]>(rawRows);
    const insertedIds = rawRows.map((row) => row.id).filter(isNonEmptyString);

    await this.emitCreateEvents(insertedIds);

    return {
      identifiers: insertedIds.map((id) => ({ id })),
      generatedMaps,
      raw: rawRows,
    };
  }

  async runBatchUpdate({
    inputs,
    columnsToReturn,
  }: {
    inputs: { id: string; data: Partial<ObjectRecord> }[];
    columnsToReturn: string[];
  }): Promise<{
    identifiers: { id: string }[];
    generatedMaps: ObjectRecord[];
    raw: ObjectRecord[];
  }> {
    const recordsBefore: ObjectRecord[] = [];
    const recordsAfter: ObjectRecord[] = [];
    const generatedMaps: ObjectRecord[] = [];

    for (const input of inputs) {
      const setColumns = formatData(
        input.data,
        this.options.flatObjectMetadata,
        this.options.internalContext.flatFieldMetadataMaps,
      );

      delete setColumns.id;

      this.validateWriteIsPermitted({
        operationType: 'update',
        columnsToReturn,
        updatedColumns: Object.keys(setColumns),
      });

      const eventSelectQueryBuilder = this.buildIdsEventSnapshotQueryBuilder([
        input.id,
      ]);

      const recordsBeforeForInput =
        await eventSelectQueryBuilder.getMany<ObjectRecord>({
          noFormatting: true,
        });

      recordsBefore.push(...recordsBeforeForInput);

      this.validateRLSPredicatesForWrittenRecords(
        this.formatResult<ObjectRecord[]>(
          recordsBeforeForInput.map((record) => ({ ...record, ...setColumns })),
        ),
        'Updated record does not satisfy row-level security constraints of your current role',
      );

      const selectQueryBuilder = this.createQueryBuilder().where({
        id: input.id,
      });

      this.applyRowLevelPermissionPredicates(selectQueryBuilder);

      const result = await selectQueryBuilder
        .update()
        .set(setColumns)
        .returning(columnsToReturn)
        .execute();

      generatedMaps.push(...(result.generatedMaps as ObjectRecord[]));

      recordsAfter.push(
        ...(await eventSelectQueryBuilder.getMany<ObjectRecord>({
          noFormatting: true,
        })),
      );
    }

    this.emitMutationEvent({ kind: 'update', recordsBefore, recordsAfter });

    return {
      identifiers: generatedMaps.map((record) => ({ id: String(record.id) })),
      generatedMaps,
      raw: generatedMaps,
    };
  }

  private buildInsertRows(records: Partial<ObjectRecord>[]): {
    columnNames: string[];
    rows: InsertRowValue[][];
    parameters: Record<string, unknown>;
    insertedColumns: string[];
    formattedRecords: Record<string, unknown>[];
  } {
    const formattedRecords = records.map((record) =>
      formatData(
        record,
        this.options.flatObjectMetadata,
        this.options.internalContext.flatFieldMetadataMaps,
      ),
    );

    const columnNameSet = new Set<string>();

    for (const record of formattedRecords) {
      for (const columnName of Object.keys(record)) {
        if (
          !isDefined(
            this.options.tableShape.columnShapeByColumnName[columnName],
          )
        ) {
          throw new TwentyOrmV2Exception(
            `Column "${columnName}" does not exist on "${this.options.tableShape.nameSingular}"`,
            TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
          );
        }
        columnNameSet.add(columnName);
      }
    }

    const columnNames = [...columnNameSet];
    const parameters: Record<string, unknown> = {};
    let parameterSequence = 0;

    const rows = formattedRecords.map((record) => {
      const valueByColumnName: Record<string, unknown> = { ...record };

      return columnNames.map((columnName): InsertRowValue => {
        if (!(columnName in valueByColumnName)) {
          return { kind: 'default' };
        }

        const parameterName = `ormV2Insert_${parameterSequence++}`;

        parameters[parameterName] = valueByColumnName[columnName];

        return { kind: 'parameter', parameterName };
      });
    });

    return {
      columnNames,
      rows,
      parameters,
      insertedColumns: columnNames,
      formattedRecords,
    };
  }

  private async emitCreateEvents(insertedIds: string[]): Promise<void> {
    if (insertedIds.length === 0) {
      return;
    }

    const recordsAfter = await this.buildIdsEventSnapshotQueryBuilder(
      insertedIds,
    ).getMany<ObjectRecord>({ noFormatting: true });

    const formattedAfter = this.formatResult<ObjectRecord[]>(recordsAfter);

    for (const action of [
      DatabaseEventAction.CREATED,
      DatabaseEventAction.UPSERTED,
    ]) {
      const event = formatTwentyOrmEventToDatabaseBatchEvent({
        action,
        objectMetadataItem: this.options.flatObjectMetadata,
        flatFieldMetadataMaps:
          this.options.internalContext.flatFieldMetadataMaps,
        workspaceId: this.options.internalContext.workspaceId,
        recordsAfter: formattedAfter,
        authContext: this.options.authContext,
      });

      if (isDefined(event)) {
        this.options.internalContext.eventEmitterService.emitDatabaseBatchEvent(
          event,
        );
      }
    }
  }

  private buildBypassingEventSelectQueryBuilder(
    alias: string,
  ): WorkspaceSelectQueryBuilderV2 {
    return new WorkspaceSelectQueryBuilderV2(alias, {
      tableShape: this.options.tableShape,
      executor: this.options.executor,
      objectRecordsPermissions: this.options.objectRecordsPermissions,
      tableShapeByObjectMetadataId: this.options.tableShapeByObjectMetadataId,
      onBeforeExecute: () => undefined,
      formatResult: (records) => this.formatResult(records),
    });
  }

  private buildIdsEventSnapshotQueryBuilder(
    ids: string[],
  ): WorkspaceSelectQueryBuilderV2 {
    return this.buildBypassingEventSelectQueryBuilder(
      this.options.tableShape.nameSingular,
    )
      .where({ id: In(ids) })
      .withDeleted();
  }

  async runMutation({
    selectQueryBuilder,
    rowLevelPermissionsApplied,
    kind,
    columnsToReturn,
    data,
  }: {
    selectQueryBuilder: WorkspaceSelectQueryBuilderV2;
    rowLevelPermissionsApplied: boolean;
    kind: MutationKind;
    columnsToReturn: string[];
    data?: Partial<ObjectRecord>;
  }): Promise<ObjectRecord[]> {
    if (!rowLevelPermissionsApplied) {
      this.applyRowLevelPermissionPredicates(selectQueryBuilder);
    }

    const setColumns =
      kind === 'update' && isDefined(data)
        ? formatData(
            data,
            this.options.flatObjectMetadata,
            this.options.internalContext.flatFieldMetadataMaps,
          )
        : undefined;

    this.validateWriteIsPermitted({
      operationType: kind,
      columnsToReturn,
      updatedColumns: isDefined(setColumns) ? Object.keys(setColumns) : [],
    });

    const eventSelectQueryBuilder =
      this.buildEventSnapshotQueryBuilder(selectQueryBuilder);

    const recordsBefore =
      kind === 'delete'
        ? [
            await eventSelectQueryBuilder.getOne<ObjectRecord>({
              noFormatting: true,
            }),
          ].filter(isDefined)
        : await eventSelectQueryBuilder.getMany<ObjectRecord>({
            noFormatting: true,
          });

    if (kind === 'update' && recordsBefore.length > QUERY_MAX_RECORDS) {
      throw new TwentyOrmV2Exception(
        `Cannot update more than ${QUERY_MAX_RECORDS} records at once`,
        TwentyOrmV2ExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        msg`You can only update up to ${QUERY_MAX_RECORDS} records at once.`,
      );
    }

    if (kind === 'update' && isDefined(setColumns)) {
      this.validateRLSPredicatesForWrittenRecords(
        this.formatResult<ObjectRecord[]>(
          recordsBefore.map((record) => ({ ...record, ...setColumns })),
        ),
        'Updated record does not satisfy row-level security constraints of your current role',
      );
    }

    const mutationResult = await this.morphAndExecute({
      selectQueryBuilder,
      kind,
      columnsToReturn,
      setColumns,
    });

    const recordsAfter =
      kind === 'delete'
        ? undefined
        : await eventSelectQueryBuilder.getMany<ObjectRecord>({
            noFormatting: true,
          });

    this.emitMutationEvent({ kind, recordsBefore, recordsAfter });

    return mutationResult.generatedMaps;
  }

  private async morphAndExecute({
    selectQueryBuilder,
    kind,
    columnsToReturn,
    setColumns,
  }: {
    selectQueryBuilder: WorkspaceSelectQueryBuilderV2;
    kind: MutationKind;
    columnsToReturn: string[];
    setColumns?: Record<string, unknown>;
  }): Promise<{ generatedMaps: ObjectRecord[] }> {
    if (kind === 'update') {
      return selectQueryBuilder
        .update()
        .set(setColumns ?? {})
        .returning(columnsToReturn)
        .execute();
    }

    const mutationQueryBuilder =
      kind === 'soft-delete'
        ? selectQueryBuilder.softDelete()
        : kind === 'restore'
          ? selectQueryBuilder.restore()
          : selectQueryBuilder.delete();

    return mutationQueryBuilder.returning(columnsToReturn).execute();
  }

  private buildEventSnapshotQueryBuilder(
    source: WorkspaceSelectQueryBuilderV2,
  ): WorkspaceSelectQueryBuilderV2 {
    return this.buildBypassingEventSelectQueryBuilder(source.alias)
      .copyWhereFrom(source)
      .withDeleted();
  }

  private validateWriteIsPermitted({
    operationType,
    columnsToReturn,
    updatedColumns,
  }: {
    operationType: MutationKind | 'insert';
    columnsToReturn: string[];
    updatedColumns: string[];
  }): void {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    validateOperationIsPermittedOrThrow({
      entityName: this.options.tableShape.nameSingular,
      operationType,
      objectsPermissions: this.options.objectRecordsPermissions,
      flatObjectMetadataMaps:
        this.options.internalContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.options.internalContext.flatFieldMetadataMaps,
      objectIdByNameSingular:
        this.options.internalContext.objectIdByNameSingular,
      selectedColumns: columnsToReturn,
      allFieldsSelected: false,
      updatedColumns,
    });
  }

  private validateRLSPredicatesForWrittenRecords(
    records: ObjectRecord[],
    errorMessage?: string,
  ): void {
    validateRLSPredicatesForRecords({
      records,
      objectMetadata: this.options.flatObjectMetadata,
      internalContext: this.options.internalContext,
      authContext: this.options.authContext,
      shouldBypassPermissionChecks: this.options.shouldBypassPermissionChecks,
      ...(isDefined(errorMessage) ? { errorMessage } : {}),
    });
  }

  private emitMutationEvent({
    kind,
    recordsBefore,
    recordsAfter,
  }: {
    kind: MutationKind;
    recordsBefore: ObjectRecord[];
    recordsAfter?: ObjectRecord[];
  }): void {
    const actions = MUTATION_EVENT_ACTIONS_BY_KIND[kind];

    const formattedBefore = this.formatResult<ObjectRecord[]>(recordsBefore);
    const formattedAfter = isDefined(recordsAfter)
      ? this.formatResult<ObjectRecord[]>(recordsAfter)
      : undefined;

    for (const action of actions) {
      const event = formatTwentyOrmEventToDatabaseBatchEvent({
        action,
        objectMetadataItem: this.options.flatObjectMetadata,
        flatFieldMetadataMaps:
          this.options.internalContext.flatFieldMetadataMaps,
        workspaceId: this.options.internalContext.workspaceId,
        recordsBefore: formattedBefore,
        recordsAfter: formattedAfter,
        authContext: this.options.authContext,
      });

      if (isDefined(event)) {
        this.options.internalContext.eventEmitterService.emitDatabaseBatchEvent(
          event,
        );
      }
    }
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

    queryBuilder.addJoinCondition(alias, renderedCondition.sql);
    queryBuilder.setParameters(renderedCondition.parameters);
  }
}
