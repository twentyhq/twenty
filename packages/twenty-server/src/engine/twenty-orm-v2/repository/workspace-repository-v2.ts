import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DeleteResult, In, InsertResult, UpdateResult } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FilesFieldSync } from 'src/engine/twenty-orm/field-operations/files-field-sync/files-field-sync';
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
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {
  applyFindOptionsToQueryBuilder,
  type FindOptionsRelationsV2,
  type FindOptionsV2,
} from 'src/engine/twenty-orm-v2/query-builder/utils/apply-find-options.util';
import {
  applyMutationCriteriaToQueryBuilder,
  type MutationCriteria,
} from 'src/engine/twenty-orm-v2/query-builder/utils/apply-mutation-criteria.util';
import { type ObjectWhereLike } from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';
import {
  attachToManyRelationToRecords,
  attachToOneRelationToRecords,
  collectForeignKeys,
  collectRecordIds,
} from 'src/engine/twenty-orm-v2/repository/utils/attach-relations.util';
import {
  matchEntitiesForUpsert,
  partitionEntitiesForSave,
} from 'src/engine/twenty-orm-v2/repository/utils/resolve-save-and-upsert.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { serializeJsonbWriteValue } from 'src/engine/twenty-orm-v2/sql/utils/serialize-jsonb-write-value.util';
import {
  type WorkspaceRelationShape,
  type WorkspaceTableShape,
} from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

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
  getRepositoryForObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceRepositoryV2;
  isTransactional: boolean;
  runInNewTransaction: <T>(
    work: (transactionalRepository: WorkspaceRepositoryV2) => Promise<T>,
  ) => Promise<T>;
};

export class WorkspaceRepositoryV2 {
  readonly objectRecordsPermissions: ObjectsPermissions;

  private readonly options: WorkspaceRepositoryV2Options;

  private _filesFieldSync?: FilesFieldSync;

  constructor(options: WorkspaceRepositoryV2Options) {
    this.options = options;
    this.objectRecordsPermissions = options.objectRecordsPermissions;
  }

  private get filesFieldSync(): FilesFieldSync {
    return (this._filesFieldSync ??= new FilesFieldSync(
      this.options.internalContext,
    ));
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

  async find(options?: FindOptionsV2): Promise<ObjectRecord[]> {
    const records = await applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getMany<ObjectRecord>();

    if (isDefined(options?.relations)) {
      await this.loadRelations(
        records,
        options.relations,
        options.withDeleted ?? false,
      );
    }

    return records;
  }

  async findBy(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<ObjectRecord[]> {
    return this.find({ where });
  }

  async findOne(options?: FindOptionsV2): Promise<ObjectRecord | null> {
    if (!isDefined(options?.where)) {
      throw new TwentyOrmV2Exception(
        'findOne requires a "where" condition',
        TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
      );
    }

    const record = await applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getOne<ObjectRecord>();

    if (isDefined(record) && isDefined(options?.relations)) {
      await this.loadRelations(
        [record],
        options.relations,
        options.withDeleted ?? false,
      );
    }

    return record;
  }

  async findOneBy(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<ObjectRecord | null> {
    return this.findOne({ where });
  }

  async findOneOrFail(options?: FindOptionsV2): Promise<ObjectRecord> {
    const record = await this.findOne(options);

    if (!isDefined(record)) {
      throw new TwentyOrmV2Exception(
        `No "${this.options.tableShape.nameSingular}" record matches the given criteria`,
        TwentyOrmV2ExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return record;
  }

  async findOneByOrFail(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<ObjectRecord> {
    return this.findOneOrFail({ where });
  }

  async count(options?: FindOptionsV2): Promise<number> {
    return applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getCount();
  }

  async countBy(where: ObjectWhereLike | ObjectWhereLike[]): Promise<number> {
    return this.count({ where });
  }

  async exists(options?: FindOptionsV2): Promise<boolean> {
    const queryBuilder = applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      {
        where: options?.where,
        withDeleted: options?.withDeleted,
      },
    );

    queryBuilder.select(['id']);

    return isDefined(await queryBuilder.getRawOne());
  }

  async existsBy(where: ObjectWhereLike | ObjectWhereLike[]): Promise<boolean> {
    return this.exists({ where });
  }

  async minimum(
    columnName: string,
    where?: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<number | null> {
    return this.aggregate('MIN', columnName, where);
  }

  async maximum(
    columnName: string,
    where?: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<number | null> {
    return this.aggregate('MAX', columnName, where);
  }

  async sum(
    columnName: string,
    where?: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<number | null> {
    return this.aggregate('SUM', columnName, where);
  }

  async average(
    columnName: string,
    where?: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<number | null> {
    return this.aggregate('AVG', columnName, where);
  }

  private async aggregate(
    sqlFunction: 'MIN' | 'MAX' | 'SUM' | 'AVG',
    columnName: string,
    where?: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<number | null> {
    if (
      !isDefined(this.options.tableShape.columnShapeByColumnName[columnName])
    ) {
      throw new TwentyOrmV2Exception(
        `Column "${columnName}" does not exist on "${this.options.tableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
      );
    }

    const queryBuilder = applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      isDefined(where) ? { where } : undefined,
    );

    queryBuilder.select([]);
    queryBuilder.addSelect(
      `${sqlFunction}(${escapeIdentifier(
        this.options.tableShape.nameSingular,
      )}.${escapeIdentifier(columnName)})`,
      'value',
    );

    const row = await queryBuilder.getRawOne<{
      value: string | number | null;
    }>();

    return isDefined(row?.value) ? Number(row.value) : null;
  }

  private async loadRelations(
    records: ObjectRecord[],
    relations: FindOptionsRelationsV2,
    withDeleted: boolean,
  ): Promise<void> {
    if (records.length === 0) {
      return;
    }

    for (const [fieldName, nested] of Object.entries(relations)) {
      if (nested === false) {
        continue;
      }

      const relationShape =
        this.options.tableShape.relationShapeByFieldName[fieldName];

      if (!isDefined(relationShape)) {
        throw new TwentyOrmV2Exception(
          `Relation "${fieldName}" does not exist on "${this.options.tableShape.nameSingular}"`,
          TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
        );
      }

      const nestedRelations = typeof nested === 'object' ? nested : undefined;
      const targetRepository = this.options.getRepositoryForObjectMetadataId(
        relationShape.targetObjectMetadataId,
      );

      if (relationShape.relationType === RelationType.MANY_TO_ONE) {
        await this.attachToOneRelation({
          records,
          fieldName,
          joinColumnName: relationShape.joinColumnName,
          targetRepository,
          nestedRelations,
        });
      } else if (relationShape.relationType === RelationType.ONE_TO_MANY) {
        await this.attachToManyRelation({
          records,
          fieldName,
          relationShape,
          targetRepository,
          nestedRelations,
          withDeleted,
        });
      } else {
        throw new TwentyOrmV2Exception(
          `Loading "${relationShape.relationType}" relations through find is not supported yet`,
          TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
        );
      }
    }
  }

  private async attachToOneRelation({
    records,
    fieldName,
    joinColumnName,
    targetRepository,
    nestedRelations,
  }: {
    records: ObjectRecord[];
    fieldName: string;
    joinColumnName?: string;
    targetRepository: WorkspaceRepositoryV2;
    nestedRelations?: FindOptionsRelationsV2;
  }): Promise<void> {
    if (!isDefined(joinColumnName)) {
      throw new TwentyOrmV2Exception(
        `Relation "${fieldName}" has no join column to resolve`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    const foreignKeys = collectForeignKeys(records, joinColumnName);

    const targets =
      foreignKeys.length > 0
        ? await targetRepository.find({
            where: { id: In(foreignKeys) },
            withDeleted: true,
            relations: nestedRelations,
          })
        : [];

    attachToOneRelationToRecords({
      records,
      fieldName,
      joinColumnName,
      targets,
    });
  }

  private async attachToManyRelation({
    records,
    fieldName,
    relationShape,
    targetRepository,
    nestedRelations,
    withDeleted,
  }: {
    records: ObjectRecord[];
    fieldName: string;
    relationShape: WorkspaceRelationShape;
    targetRepository: WorkspaceRepositoryV2;
    nestedRelations?: FindOptionsRelationsV2;
    withDeleted: boolean;
  }): Promise<void> {
    const inverseForeignKeyColumnName =
      this.resolveInverseForeignKeyColumnName(relationShape);

    const parentIds = collectRecordIds(records);

    const children =
      parentIds.length > 0
        ? await targetRepository.find({
            where: { [inverseForeignKeyColumnName]: In(parentIds) },
            relations: nestedRelations,
            withDeleted,
          })
        : [];

    attachToManyRelationToRecords({
      records,
      fieldName,
      inverseForeignKeyColumnName,
      children,
    });
  }

  private resolveInverseForeignKeyColumnName(
    relationShape: WorkspaceRelationShape,
  ): string {
    const targetTableShape = this.options.tableShapeByObjectMetadataId(
      relationShape.targetObjectMetadataId,
    );

    const inverseRelationShape = Object.values(
      targetTableShape.relationShapeByFieldName,
    ).find(
      (candidate) =>
        candidate.fieldMetadataId === relationShape.targetFieldMetadataId,
    );

    if (!isDefined(inverseRelationShape?.joinColumnName)) {
      throw new TwentyOrmV2Exception(
        `Could not resolve the inverse foreign key for a to-many relation on "${this.options.tableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    return inverseRelationShape.joinColumnName;
  }

  async insert(
    entityOrEntities: Partial<ObjectRecord> | Partial<ObjectRecord>[],
  ): Promise<InsertResult> {
    const records = Array.isArray(entityOrEntities)
      ? entityOrEntities
      : [entityOrEntities];

    const { identifiers, generatedMaps, raw } = await this.runInsert({
      records,
      columnsToReturn: ['id'],
    });

    const insertResult = new InsertResult();

    insertResult.identifiers = identifiers;
    insertResult.generatedMaps = generatedMaps;
    insertResult.raw = raw;

    return insertResult;
  }

  async update(
    criteria: MutationCriteria,
    partialEntity: Partial<ObjectRecord>,
  ): Promise<UpdateResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'update',
      columnsToReturn: ['id'],
      data: partialEntity,
    });

    return this.buildUpdateResult(records);
  }

  async updateMany(
    inputs: { criteria: string; partialEntity: Partial<ObjectRecord> }[],
  ): Promise<UpdateResult> {
    if (inputs.length > QUERY_MAX_RECORDS) {
      throw new TwentyOrmV2Exception(
        `Cannot update more than ${QUERY_MAX_RECORDS} records at once`,
        TwentyOrmV2ExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        msg`You can only update up to ${QUERY_MAX_RECORDS} records at once.`,
      );
    }

    const { generatedMaps, raw } = await this.runBatchUpdate({
      inputs: inputs.map((input) => ({
        id: input.criteria,
        data: input.partialEntity,
      })),
      columnsToReturn: ['id'],
    });

    const updateResult = new UpdateResult();

    updateResult.raw = raw;
    updateResult.affected = raw.length;
    updateResult.generatedMaps = generatedMaps;

    return updateResult;
  }

  async delete(criteria: MutationCriteria): Promise<DeleteResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'delete',
      columnsToReturn: ['id'],
    });

    const deleteResult = new DeleteResult();

    deleteResult.raw = records;
    deleteResult.affected = records.length;

    return deleteResult;
  }

  async softDelete(criteria: MutationCriteria): Promise<UpdateResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'soft-delete',
      columnsToReturn: ['id'],
    });

    return this.buildUpdateResult(records);
  }

  async restore(criteria: MutationCriteria): Promise<UpdateResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'restore',
      columnsToReturn: ['id'],
    });

    return this.buildUpdateResult(records);
  }

  private buildUpdateResult(records: ObjectRecord[]): UpdateResult {
    const updateResult = new UpdateResult();

    updateResult.raw = records;
    updateResult.affected = records.length;
    updateResult.generatedMaps = records;

    return updateResult;
  }

  private runAtomically<T>(
    work: (repository: WorkspaceRepositoryV2) => Promise<T>,
  ): Promise<T> {
    return this.options.isTransactional
      ? work(this)
      : this.options.runInNewTransaction(work);
  }

  // Existence check for save/upsert: bypasses row-level permissions and includes
  // soft-deleted rows so an existing-but-hidden id is updated rather than
  // misclassified as an insert (which would raise a duplicate-key error).
  private async findExistingIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) {
      return new Set<string>();
    }

    const { schemaName, tableName } = this.options.tableShape;
    const rows = await this.executeRaw<{ id: string }>(
      `SELECT "id" FROM ${escapeIdentifier(schemaName)}.${escapeIdentifier(
        tableName,
      )} WHERE "id" IN (:...ids)`,
      { ids },
    );

    return new Set(rows.map((row) => row.id));
  }

  async save(
    entityOrEntities: Partial<ObjectRecord> | Partial<ObjectRecord>[],
  ): Promise<ObjectRecord[]> {
    const entities = Array.isArray(entityOrEntities)
      ? entityOrEntities
      : [entityOrEntities];

    this.assertNoNestedRelationObjects(entities);

    if (entities.length === 0) {
      return [];
    }

    return this.runAtomically(async (repository) => {
      const existingIds = await repository.findExistingIds(
        entities.map((entity) => entity.id).filter(isNonEmptyString),
      );

      const { toUpdate, toInsert } = partitionEntitiesForSave(
        entities,
        existingIds,
      );

      if (toUpdate.length > 0) {
        await repository.runBatchUpdate({
          inputs: toUpdate.flatMap((entity) =>
            isNonEmptyString(entity.id)
              ? [{ id: entity.id, data: entity }]
              : [],
          ),
          columnsToReturn: ['id'],
        });
      }

      // runInsert returns identifiers in the same order as `toInsert`, which
      // partitionEntitiesForSave builds in input order.
      const insertedIds =
        toInsert.length > 0
          ? (
              await repository.runInsert({
                records: toInsert,
                columnsToReturn: ['id'],
              })
            ).identifiers.map((identifier) => identifier.id)
          : [];

      const savedIds = [
        ...toUpdate.map((entity) => entity.id).filter(isNonEmptyString),
        ...insertedIds.filter(isNonEmptyString),
      ];

      const savedById = new Map(
        savedIds.length > 0
          ? (await repository.find({ where: { id: In(savedIds) } })).map(
              (record) => [record.id, record],
            )
          : [],
      );

      let insertCursor = 0;

      return entities.flatMap((entity) => {
        const savedId =
          isNonEmptyString(entity.id) && existingIds.has(entity.id)
            ? entity.id
            : insertedIds[insertCursor++];
        const record = isNonEmptyString(savedId)
          ? savedById.get(savedId)
          : undefined;

        return isDefined(record) ? [record] : [];
      });
    });
  }

  async upsert(
    entityOrEntities: Partial<ObjectRecord> | Partial<ObjectRecord>[],
    conflictPathsOrOptions: string[] | { conflictPaths: string[] },
  ): Promise<InsertResult> {
    const entities = Array.isArray(entityOrEntities)
      ? entityOrEntities
      : [entityOrEntities];

    this.assertNoNestedRelationObjects(entities);

    const conflictPaths = Array.isArray(conflictPathsOrOptions)
      ? conflictPathsOrOptions
      : conflictPathsOrOptions.conflictPaths;

    if (conflictPaths.length === 0) {
      throw new TwentyOrmV2Exception(
        'upsert requires at least one conflict path',
        TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
      );
    }

    if (entities.length === 0) {
      return new InsertResult();
    }

    return this.runAtomically(async (repository) => {
      const conflictWhere = entities.map((entity) =>
        Object.fromEntries(
          conflictPaths.map((path) => [path, entity[path] ?? null]),
        ),
      );

      const existingRecords = await repository.find({
        where: conflictWhere,
        withDeleted: true,
      });

      const { toUpdate, toInsert } = matchEntitiesForUpsert(
        entities,
        existingRecords,
        conflictPaths,
      );

      const emptyOutcome = { identifiers: [], generatedMaps: [], raw: [] };

      const updateOutcome =
        toUpdate.length > 0
          ? await repository.runBatchUpdate({
              inputs: toUpdate.map((match) => ({
                id: match.id,
                data: match.entity,
              })),
              columnsToReturn: ['id'],
            })
          : emptyOutcome;

      const insertOutcome =
        toInsert.length > 0
          ? await repository.runInsert({
              records: toInsert,
              columnsToReturn: ['id'],
            })
          : emptyOutcome;

      const insertResult = new InsertResult();

      insertResult.identifiers = [
        ...updateOutcome.identifiers,
        ...insertOutcome.identifiers,
      ];
      insertResult.generatedMaps = [
        ...updateOutcome.generatedMaps,
        ...insertOutcome.generatedMaps,
      ];
      insertResult.raw = [...updateOutcome.raw, ...insertOutcome.raw];

      return insertResult;
    });
  }

  private assertNoNestedRelationObjects(
    entities: Partial<ObjectRecord>[],
  ): void {
    for (const entity of entities) {
      for (const key of Object.keys(entity)) {
        const value = entity[key];

        if (
          isDefined(this.options.tableShape.relationShapeByFieldName[key]) &&
          typeof value === 'object' &&
          value !== null
        ) {
          throw new TwentyOrmV2Exception(
            `Writing nested relation "${key}" through the ORM v2 repository is not supported yet`,
            TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
          );
        }
      }
    }
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
    if (records.length === 0) {
      return { identifiers: [], generatedMaps: [], raw: [] };
    }

    const filesFieldDiff =
      this.filesFieldSync.computeFilesFieldDiffBeforeInsert(
        records,
        this.options.tableShape.nameSingular,
      );

    let filesFieldFileIds = null;
    let recordsToInsert = records;

    if (isDefined(filesFieldDiff)) {
      const enriched = await this.filesFieldSync.enrichFilesFields({
        entities: records,
        filesFieldDiffByEntityIndex: filesFieldDiff,
        workspaceId: this.options.internalContext.workspaceId,
        target: this.options.tableShape.nameSingular,
      });

      filesFieldFileIds = enriched.fileIds;
      recordsToInsert = enriched.entities as Partial<ObjectRecord>[];
    }

    const { columnNames, rows, parameters, insertedColumns, formattedRecords } =
      this.buildInsertRows(recordsToInsert);

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

    if (isDefined(filesFieldFileIds)) {
      await this.filesFieldSync.updateFileEntityRecords(filesFieldFileIds);
    }

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
    if (inputs.length === 0) {
      return { identifiers: [], generatedMaps: [], raw: [] };
    }

    const recordsBefore: ObjectRecord[] = [];
    const recordsAfter: ObjectRecord[] = [];
    const generatedMaps: ObjectRecord[] = [];

    const rawBeforeByInputIndex: ObjectRecord[][] = [];
    const existingRecordsMapById: Record<string, ObjectRecord> = {};

    for (const input of inputs) {
      const rawBefore = await this.buildIdsEventSnapshotQueryBuilder([
        input.id,
      ]).getMany<ObjectRecord>({ noFormatting: true });

      rawBeforeByInputIndex.push(rawBefore);

      for (const formattedRecord of this.formatResult<ObjectRecord[]>(
        rawBefore,
      )) {
        if (isDefined(formattedRecord.id)) {
          existingRecordsMapById[formattedRecord.id] = formattedRecord;
        }
      }
    }

    let dataByInputIndex = inputs.map((input) => input.data);
    let filesFieldFileIds = null;

    const filesFieldDiff =
      this.filesFieldSync.computeFilesFieldDiffBeforeUpsert(
        dataByInputIndex,
        this.options.tableShape.nameSingular,
        existingRecordsMapById,
      );

    if (isDefined(filesFieldDiff)) {
      const enriched = await this.filesFieldSync.enrichFilesFields({
        entities: dataByInputIndex,
        filesFieldDiffByEntityIndex: filesFieldDiff,
        workspaceId: this.options.internalContext.workspaceId,
        target: this.options.tableShape.nameSingular,
      });

      filesFieldFileIds = enriched.fileIds;
      dataByInputIndex = enriched.entities as Partial<ObjectRecord>[];
    }

    for (const [index, input] of inputs.entries()) {
      const { id: _id, ...setColumns } = formatData(
        dataByInputIndex[index],
        this.options.flatObjectMetadata,
        this.options.internalContext.flatFieldMetadataMaps,
      );

      this.validateWriteIsPermitted({
        operationType: 'update',
        columnsToReturn,
        updatedColumns: Object.keys(setColumns),
      });

      const rawBeforeForInput = rawBeforeByInputIndex[index];

      recordsBefore.push(...rawBeforeForInput);

      this.validateRLSPredicatesForWrittenRecords(
        this.formatResult<ObjectRecord[]>(
          rawBeforeForInput.map((record) => ({ ...record, ...setColumns })),
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
        ...(await this.buildIdsEventSnapshotQueryBuilder([
          input.id,
        ]).getMany<ObjectRecord>({
          noFormatting: true,
        })),
      );
    }

    if (isDefined(filesFieldFileIds)) {
      await this.filesFieldSync.updateFileEntityRecords(filesFieldFileIds);
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

        parameters[parameterName] = serializeJsonbWriteValue(
          this.options.tableShape.columnShapeByColumnName[columnName],
          valueByColumnName[columnName],
        );

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

    let filesFieldFileIds = null;
    let dataToWrite = data;

    if (kind === 'update' && isDefined(data)) {
      const formattedBefore = this.formatResult<ObjectRecord[]>(recordsBefore);
      const filesFieldDiff =
        this.filesFieldSync.computeFilesFieldDiffBeforeUpdateOne(
          data,
          this.options.tableShape.nameSingular,
          formattedBefore,
        );

      if (isDefined(filesFieldDiff)) {
        const enriched = await this.filesFieldSync.enrichFilesFields({
          entities: formattedBefore.map(() => data),
          filesFieldDiffByEntityIndex: filesFieldDiff,
          workspaceId: this.options.internalContext.workspaceId,
          target: this.options.tableShape.nameSingular,
        });

        filesFieldFileIds = enriched.fileIds;
        dataToWrite = enriched.entities[0] as Partial<ObjectRecord>;
      }
    }

    const setColumns =
      kind === 'update' && isDefined(dataToWrite)
        ? formatData(
            dataToWrite,
            this.options.flatObjectMetadata,
            this.options.internalContext.flatFieldMetadataMaps,
          )
        : undefined;

    this.validateWriteIsPermitted({
      operationType: kind,
      columnsToReturn,
      updatedColumns: isDefined(setColumns) ? Object.keys(setColumns) : [],
    });

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

    if (isDefined(filesFieldFileIds)) {
      await this.filesFieldSync.updateFileEntityRecords(filesFieldFileIds);
    }

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
