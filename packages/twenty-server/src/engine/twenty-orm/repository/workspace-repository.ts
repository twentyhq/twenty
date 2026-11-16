import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  type ObjectRecord,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  isValidationRulePreviousValuePath,
} from 'twenty-shared/utils';
import {
  DeleteResult,
  In,
  InsertResult,
  type ObjectLiteral,
  UpdateResult,
} from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isRecordStockTrackedObject } from 'src/engine/core-modules/usage-limit/utils/is-record-stock-tracked-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import uniqBy from 'lodash.uniqby';
import { FilesFieldSync } from 'src/engine/twenty-orm/field-operations/files-field-sync/files-field-sync';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { NO_RECORD_READ_RESTRICTIONS } from 'src/engine/permissions/constants/no-record-read-restrictions.constant';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import {
  getUpdateEventRecords,
  mergeRecordsWithUpdateValues,
} from 'src/engine/twenty-orm/utils/merge-records-with-update-values.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getActiveValidationRules } from 'src/engine/twenty-orm/utils/get-active-validation-rules.util';
import { validateRecordsAgainstValidationRulesOrThrow } from 'src/engine/twenty-orm/utils/validate-records-against-validation-rules.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';
import {
  buildInsertStatement,
  type InsertRowValue,
} from 'src/engine/twenty-orm/sql/utils/build-insert-statement.util';
import { type MutationKind } from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {
  applyFindOptionsToQueryBuilder,
  normalizeFindOptionsRelations,
  splitFindOptionsOrder,
  type WorkspaceFindOptionsRelations,
  type WorkspaceFindOptions,
} from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';
import {
  applyMutationCriteriaToQueryBuilder,
  type MutationCriteria,
} from 'src/engine/twenty-orm/query-builder/utils/apply-mutation-criteria.util';
import {
  type ObjectWhereLike,
  type OrderByConditionLike,
} from 'src/engine/twenty-orm/query-builder/types/query-builder.type';
import {
  attachToManyRelationToRecords,
  attachToOneRelationToRecords,
  collectForeignKeys,
  collectRecordIds,
} from 'src/engine/twenty-orm/repository/utils/attach-relations.util';
import {
  matchEntitiesForUpsert,
  partitionEntitiesForSave,
} from 'src/engine/twenty-orm/repository/utils/resolve-save-and-upsert.util';
import {
  getUpdateEventColumnsToReturn,
  mergeReturnedUpdateTimestamps,
} from 'src/engine/twenty-orm/repository/utils/update-event-records.util';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { compileTwentyOrmStatement } from 'src/engine/twenty-orm/utils/compile-twenty-orm-statement.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { serializeJsonbWriteValue } from 'src/engine/twenty-orm/sql/utils/serialize-jsonb-write-value.util';
import {
  type WorkspaceRelationShape,
  type WorkspaceTableShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

const ALWAYS_FALSE_CONDITION = '1=0';
const MUTATION_EVENT_ACTIONS_BY_KIND: Record<
  MutationKind,
  DatabaseEventAction[]
> = {
  delete: [DatabaseEventAction.DESTROYED],
  restore: [DatabaseEventAction.RESTORED],
  'soft-delete': [DatabaseEventAction.DELETED],
  update: [DatabaseEventAction.UPDATED, DatabaseEventAction.UPSERTED],
};

const OPERATION_TYPE_BY_MUTATION_KIND: Record<
  MutationKind,
  Exclude<ObjectRecordsOperationType, 'read'>
> = {
  delete: 'destroy',
  restore: 'softDelete',
  'soft-delete': 'softDelete',
  update: 'update',
};

type WrittenRecordsValidator = {
  shouldReadRecordsBeforeWrite: boolean;
  validate: (args: {
    writtenRecords: ObjectRecord[];
    recordsBeforeWrite: ObjectRecord[];
  }) => Promise<void>;
};

type WorkspaceRepositoryOptions<TEntity extends ObjectLiteral> = {
  tableShape: WorkspaceTableShape;
  flatObjectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  executor: QueryExecutor;
  permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
  shouldBypassPermissionChecks: boolean;
  // Suppresses database events and their snapshot SELECT, for bulk system writes only: webhooks, workflow triggers
  // and timeline activities will NOT fire
  shouldSkipEventEmission: boolean;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  flatObjectMetadataByObjectMetadataId: (
    objectMetadataId: string,
  ) => FlatObjectMetadata;
  getRepositoryForObjectMetadataId: <
    Entity extends ObjectLiteral = ObjectRecord,
  >(
    objectMetadataId: string,
  ) => WorkspaceRepository<Entity>;
  isTransactional: boolean;
  runInNewTransaction: <T>(
    work: (transactionalRepository: WorkspaceRepository<TEntity>) => Promise<T>,
  ) => Promise<T>;
};

export class WorkspaceRepository<TEntity extends ObjectLiteral = ObjectRecord> {
  private readonly options: WorkspaceRepositoryOptions<TEntity>;

  private _filesFieldSync?: FilesFieldSync;

  constructor(options: WorkspaceRepositoryOptions<TEntity>) {
    this.options = options;
  }

  private get recordReadRestrictions(): RecordReadRestrictions {
    const { permissionsPrincipals, shouldBypassPermissionChecks } =
      this.options;

    if (shouldBypassPermissionChecks || !isDefined(permissionsPrincipals)) {
      return NO_RECORD_READ_RESTRICTIONS;
    }

    return this.options.internalContext.recordReadRestrictions;
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
    const compiled = compileTwentyOrmStatement({ sql, parameters });

    return this.options.executor.execute(compiled) as Promise<T[]>;
  }

  createQueryBuilder(alias?: string): WorkspaceSelectQueryBuilder {
    return new WorkspaceSelectQueryBuilder(
      alias ?? this.options.tableShape.nameSingular,
      {
        tableShape: this.options.tableShape,
        executor: this.options.executor,
        recordReadRestrictions: this.recordReadRestrictions,
        featureFlagsMap: this.options.internalContext.featureFlagsMap,
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

  // Strip undefined like TypeORM does, so they neither throw as unknown fields nor bind as NULL
  private formatWriteData(
    data: Partial<ObjectRecord>,
  ): Record<string, unknown> {
    const definedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    return formatData(
      definedData,
      this.options.flatObjectMetadata,
      this.options.internalContext.flatFieldMetadataMaps,
    );
  }

  async applyWriteRowLevelPermissions(
    queryBuilder: WorkspaceSelectQueryBuilder,
    kind: MutationKind,
  ): Promise<void> {
    await this.applyRowLevelPermissionPredicates(
      queryBuilder,
      OPERATION_TYPE_BY_MUTATION_KIND[kind],
    );
  }

  get internalContext(): WorkspaceInternalContext {
    return this.options.internalContext;
  }

  getRepositoryForObjectMetadataId<Entity extends ObjectLiteral = ObjectRecord>(
    objectMetadataId: string,
  ): WorkspaceRepository<Entity> {
    return this.options.getRepositoryForObjectMetadataId<Entity>(
      objectMetadataId,
    );
  }

  async find(options?: WorkspaceFindOptions): Promise<TEntity[]> {
    const records = await applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getMany<ObjectRecord>();

    if (isDefined(options?.relations)) {
      await this.loadRelations(
        records,
        normalizeFindOptionsRelations(options.relations),
        options.withDeleted ?? false,
        splitFindOptionsOrder(this.options.tableShape, options.order)
          .orderByRelationFieldName,
      );
    }

    return records as unknown as TEntity[];
  }

  async findBy(where: ObjectWhereLike | ObjectWhereLike[]): Promise<TEntity[]> {
    return this.find({ where });
  }

  async findAndCount(
    options?: WorkspaceFindOptions,
  ): Promise<[TEntity[], number]> {
    const records = await this.find(options);
    const totalCount = await this.count(options);

    return [records, totalCount];
  }

  async findAndCountBy(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<[TEntity[], number]> {
    return this.findAndCount({ where });
  }

  async findOne(options?: WorkspaceFindOptions): Promise<TEntity | null> {
    if (!isDefined(options?.where)) {
      throw new TwentyOrmException(
        'findOne requires a "where" condition',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    const record = await applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getOne<ObjectRecord>();

    if (isDefined(record) && isDefined(options?.relations)) {
      await this.loadRelations(
        [record],
        normalizeFindOptionsRelations(options.relations),
        options.withDeleted ?? false,
        splitFindOptionsOrder(this.options.tableShape, options.order)
          .orderByRelationFieldName,
      );
    }

    return record as unknown as TEntity | null;
  }

  async findOneBy(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<TEntity | null> {
    return this.findOne({ where });
  }

  async findOneOrFail(options?: WorkspaceFindOptions): Promise<TEntity> {
    const record = await this.findOne(options);

    if (!isDefined(record)) {
      throw new TwentyOrmException(
        `No "${this.options.tableShape.nameSingular}" record matches the given criteria`,
        TwentyOrmExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return record;
  }

  async findOneByOrFail(
    where: ObjectWhereLike | ObjectWhereLike[],
  ): Promise<TEntity> {
    return this.findOneOrFail({ where });
  }

  async count(options?: WorkspaceFindOptions): Promise<number> {
    return applyFindOptionsToQueryBuilder(
      this.createQueryBuilder(),
      options,
    ).getCount();
  }

  async countBy(where: ObjectWhereLike | ObjectWhereLike[]): Promise<number> {
    return this.count({ where });
  }

  async exists(options?: WorkspaceFindOptions): Promise<boolean> {
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
      throw new TwentyOrmException(
        `Column "${columnName}" does not exist on "${this.options.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
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
    relations: WorkspaceFindOptionsRelations,
    withDeleted: boolean,
    orderByRelationFieldName: Record<string, OrderByConditionLike> = {},
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
        throw new TwentyOrmException(
          `Relation "${fieldName}" does not exist on "${this.options.tableShape.nameSingular}"`,
          TwentyOrmExceptionCode.UNKNOWN_RELATION,
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
          order: orderByRelationFieldName[fieldName],
        });
      } else {
        throw new TwentyOrmException(
          `Loading "${relationShape.relationType}" relations through find is not supported yet`,
          TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
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
    targetRepository: WorkspaceRepository;
    nestedRelations?: WorkspaceFindOptionsRelations;
  }): Promise<void> {
    if (!isDefined(joinColumnName)) {
      throw new TwentyOrmException(
        `Relation "${fieldName}" has no join column to resolve`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
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
    order,
  }: {
    records: ObjectRecord[];
    fieldName: string;
    relationShape: WorkspaceRelationShape;
    targetRepository: WorkspaceRepository;
    nestedRelations?: WorkspaceFindOptionsRelations;
    withDeleted: boolean;
    order?: OrderByConditionLike;
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
            order,
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
      throw new TwentyOrmException(
        `Could not resolve the inverse foreign key for a to-many relation on "${this.options.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    return inverseRelationShape.joinColumnName;
  }

  async insert(
    entityOrEntities: Partial<ObjectRecord> | Partial<ObjectRecord>[],
    options?: { onConflictDoNothing?: boolean },
  ): Promise<InsertResult> {
    const records = Array.isArray(entityOrEntities)
      ? entityOrEntities
      : [entityOrEntities];

    const { identifiers, generatedMaps, raw } = await this.runInsert({
      records,
      columnsToReturn: this.options.shouldBypassPermissionChecks
        ? Object.keys(this.options.tableShape.columnShapeByColumnName)
        : ['id'],
      onConflictDoNothing: options?.onConflictDoNothing,
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
    options?: { columnsToReturn?: string[] },
  ): Promise<UpdateResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'update',
      columnsToReturn: options?.columnsToReturn ?? ['id'],
      data: partialEntity,
    });

    return this.buildUpdateResult(records);
  }

  async updateMany(
    inputs: { criteria: string; partialEntity: Partial<ObjectRecord> }[],
  ): Promise<UpdateResult> {
    if (inputs.length > QUERY_MAX_RECORDS) {
      throw new TwentyOrmException(
        `Cannot update more than ${QUERY_MAX_RECORDS} records at once`,
        TwentyOrmExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        {
          userFriendlyMessage: msg`You can only update up to ${QUERY_MAX_RECORDS} records at once.`,
        },
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

  async delete(
    criteria: MutationCriteria,
    options?: { columnsToReturn?: string[] },
  ): Promise<DeleteResult> {
    const records = await this.runMutation({
      selectQueryBuilder: applyMutationCriteriaToQueryBuilder(
        this.createQueryBuilder(),
        criteria,
      ),
      rowLevelPermissionsApplied: false,
      kind: 'delete',
      columnsToReturn: options?.columnsToReturn ?? ['id'],
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
    work: (repository: WorkspaceRepository<TEntity>) => Promise<T>,
  ): Promise<T> {
    return this.options.isTransactional
      ? work(this)
      : this.options.runInNewTransaction(work);
  }

  private async runWithValidationRules<TResult>({
    write,
    inputRecordIds,
  }: {
    write: (
      repository: WorkspaceRepository<TEntity>,
      writtenRecordsValidator?: WrittenRecordsValidator,
    ) => Promise<TResult>;
    inputRecordIds?: (string | undefined)[];
  }): Promise<TResult> {
    const validationRules = getActiveValidationRules({
      flatValidationRuleMaps:
        this.options.internalContext.flatValidationRuleMaps,
      objectMetadataId: this.options.flatObjectMetadata.id,
    });

    if (validationRules.length === 0) {
      return (await this.options.internalContext.recordAccessGroupWrite.isWriteTransactionRequired(
        this.buildRecordAccessGroupWriteTarget(),
      ))
        ? this.runAtomically((repository) => write(repository))
        : write(this);
    }

    const shouldReadRecordsBeforeWrite = validationRules.some(
      (validationRule) =>
        Object.keys(validationRule.bindings).some(
          isValidationRulePreviousValuePath,
        ),
    );

    return this.runAtomically((repository) =>
      write(repository, {
        shouldReadRecordsBeforeWrite,
        validate: ({ writtenRecords, recordsBeforeWrite }) =>
          validateRecordsAgainstValidationRulesOrThrow({
            repository,
            tableShape: this.options.tableShape,
            validationRules,
            writtenRecords,
            recordsBeforeWrite,
            inputRecordIds,
          }),
      }),
    );
  }

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
  ): Promise<TEntity[]> {
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
          ? (
              await repository.find({
                where: { id: In(savedIds) },
                withDeleted: true,
              })
            ).map((record) => [record.id, record])
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
      }) as unknown as TEntity[];
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
      throw new TwentyOrmException(
        'upsert requires at least one conflict path',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
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

      const existingRecords = await applyFindOptionsToQueryBuilder(
        repository.buildBypassingEventSelectQueryBuilder(
          repository.options.tableShape.nameSingular,
        ),
        { where: conflictWhere, withDeleted: true },
      ).getMany<ObjectRecord>();

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
          throw new TwentyOrmException(
            `Writing nested relation "${key}" through the ORM v2 repository is not supported yet`,
            TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
          );
        }
      }
    }
  }

  async runInsert(args: {
    records: Partial<ObjectRecord>[];
    columnsToReturn: string[];
    onConflictDoNothing?: boolean;
  }): Promise<{
    identifiers: { id: string }[];
    generatedMaps: ObjectRecord[];
    raw: ObjectRecord[];
  }> {
    return this.runWithValidationRules({
      inputRecordIds: args.records.map((record) => record.id),
      write: (repository, writtenRecordsValidator) =>
        repository.performInsert({ ...args, writtenRecordsValidator }),
    });
  }

  private async performInsert({
    records,
    columnsToReturn,
    onConflictDoNothing,
    writtenRecordsValidator,
  }: {
    records: Partial<ObjectRecord>[];
    columnsToReturn: string[];
    onConflictDoNothing?: boolean;
    writtenRecordsValidator?: WrittenRecordsValidator;
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

    await this.validateWriteIsPermitted({
      operationType: 'create',
      columnsToReturn,
      updatedColumns: insertedColumns,
    });

    if (!this.options.shouldBypassPermissionChecks) {
      await this.options.internalContext.recordPermissions.assertCreatedRecordsMatchRowLevelPermissionsOrThrow(
        {
          principals: this.resolvePermissionsPrincipalsOrThrow(),
          objectMetadataId: this.options.flatObjectMetadata.id,
          records: this.formatResult<ObjectRecord[]>(formattedRecords),
          transactionScope: this.buildRecordPermissionTransactionScope(),
        },
      );
    }

    await this.assertRecordStockAvailable(recordsToInsert.length);

    const sql = buildInsertStatement({
      tableShape: this.options.tableShape,
      columnNames,
      rows,
      returningColumns: columnsToReturn,
      onConflictDoNothing,
    });

    const rawRows = await this.executeRaw<ObjectRecord>(sql, parameters);

    await writtenRecordsValidator?.validate({
      writtenRecords: rawRows,
      recordsBeforeWrite: [],
    });

    await this.acquireRecordStock(rawRows.length);

    if (isDefined(filesFieldFileIds)) {
      await this.filesFieldSync.updateFileEntityRecords(filesFieldFileIds);
    }

    const generatedMaps = this.formatResult<ObjectRecord[]>(rawRows);
    const insertedIds = rawRows.map((row) => row.id).filter(isNonEmptyString);

    await this.recomputeRecordAccessGroupIdsAfterWrite({
      writtenRecordIds: insertedIds,
      isRecomputingWrittenRecords: true,
      recordsBefore: [],
    });

    await this.emitCreateEvents(insertedIds);

    return {
      identifiers: insertedIds.map((id) => ({ id })),
      generatedMaps,
      raw: rawRows,
    };
  }

  async runBatchUpdate(args: {
    inputs: { id: string; data: Partial<ObjectRecord> }[];
    columnsToReturn: string[];
  }): Promise<{
    identifiers: { id: string }[];
    generatedMaps: ObjectRecord[];
    raw: ObjectRecord[];
  }> {
    return this.runWithValidationRules({
      inputRecordIds: args.inputs.map((input) => input.id),
      write: (repository, writtenRecordsValidator) =>
        repository.performBatchUpdate({ ...args, writtenRecordsValidator }),
    });
  }

  private async performBatchUpdate({
    inputs,
    columnsToReturn,
    writtenRecordsValidator,
  }: {
    inputs: { id: string; data: Partial<ObjectRecord> }[];
    columnsToReturn: string[];
    writtenRecordsValidator?: WrittenRecordsValidator;
  }): Promise<{
    identifiers: { id: string }[];
    generatedMaps: ObjectRecord[];
    raw: ObjectRecord[];
  }> {
    if (inputs.length === 0) {
      return { identifiers: [], generatedMaps: [], raw: [] };
    }

    const writableRecordIds = await this.resolveWritableRecordIds({
      ids: inputs.map((input) => input.id),
      operationType: 'update',
    });
    const writableInputs = inputs.filter((input) =>
      writableRecordIds.has(input.id),
    );

    const recordsBefore: ObjectRecord[] = [];
    const recordsAfter: ObjectRecord[] = [];
    const generatedMaps: ObjectRecord[] = [];
    const updateEventColumnsToReturn = getUpdateEventColumnsToReturn(
      columnsToReturn,
      this.options.tableShape,
    );

    const rawBeforeByInputIndex: ObjectRecord[][] = [];
    const existingRecordsMapById: Record<string, ObjectRecord> = {};

    for (const input of writableInputs) {
      const recordBeforeQueryBuilder = this.buildIdsEventSnapshotQueryBuilder([
        input.id,
      ]);

      if (writtenRecordsValidator?.shouldReadRecordsBeforeWrite) {
        recordBeforeQueryBuilder.forUpdate();
      }

      const rawBefore = await recordBeforeQueryBuilder.getMany<ObjectRecord>({
        noFormatting: true,
      });

      rawBeforeByInputIndex.push(rawBefore);

      for (const formattedRecord of this.formatResult<ObjectRecord[]>(
        rawBefore,
      )) {
        if (isDefined(formattedRecord.id)) {
          existingRecordsMapById[formattedRecord.id] = formattedRecord;
        }
      }
    }

    let dataByInputIndex = writableInputs.map((input) => input.data);
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

    const writtenRecords = dataByInputIndex.map((data) =>
      this.formatWriteData(data),
    );

    const setColumnsByInputIndex = writtenRecords.map(
      ({ id: _id, ...setColumns }) => setColumns,
    );

    const distinctUpdatedColumns = uniqBy(
      setColumnsByInputIndex.map((setColumns) =>
        Object.keys(setColumns).sort(),
      ),
      (updatedColumns) => updatedColumns.join(','),
    );

    for (const updatedColumns of distinctUpdatedColumns) {
      await this.validateWriteIsPermitted({
        operationType: 'update',
        columnsToReturn,
        updatedColumns,
      });
    }

    await this.validateRLSPredicatesForUpdatedRecords(
      setColumnsByInputIndex.flatMap((setColumns, index) =>
        rawBeforeByInputIndex[index].map((rawRecordBefore) => ({
          rawRecordBefore,
          setColumns,
        })),
      ),
    );

    for (const [index, input] of writableInputs.entries()) {
      const setColumns = setColumnsByInputIndex[index];
      const rawBeforeForInput = rawBeforeByInputIndex[index];

      const selectQueryBuilder = this.createQueryBuilder().where({
        id: input.id,
      });

      await this.applyRowLevelPermissionPredicates(
        selectQueryBuilder,
        'update',
      );

      const result = await this.morphAndExecute({
        selectQueryBuilder,
        kind: 'update',
        columnsToReturn: updateEventColumnsToReturn,
        setColumns,
      });

      generatedMaps.push(...result.generatedMaps);

      if (result.generatedMaps.length === 0) {
        continue;
      }

      recordsBefore.push(...rawBeforeForInput);

      const recordsAfterWrite = this.options.shouldSkipEventEmission
        ? []
        : await this.buildIdsEventSnapshotQueryBuilder([
            input.id,
          ]).getMany<ObjectRecord>({
            noFormatting: true,
          });

      recordsAfter.push(
        ...mergeReturnedUpdateTimestamps(
          mergeRecordsWithUpdateValues(
            getUpdateEventRecords(rawBeforeForInput, recordsAfterWrite),
            setColumns,
          ),
          result.generatedMaps,
        ),
      );
    }

    await writtenRecordsValidator?.validate({
      writtenRecords: generatedMaps,
      recordsBeforeWrite: Object.values(existingRecordsMapById),
    });

    await this.recomputeRecordAccessGroupIdsAfterWrite({
      writtenRecordIds: generatedMaps
        .map((record) => record.id)
        .filter(isNonEmptyString),
      isRecomputingWrittenRecords: true,
      recordsBefore,
      updatedColumnNames: distinctUpdatedColumns.flat(),
    });

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
      this.formatWriteData(record),
    );

    const columnNameSet = new Set<string>();

    for (const record of formattedRecords) {
      for (const columnName of Object.keys(record)) {
        if (
          !isDefined(
            this.options.tableShape.columnShapeByColumnName[columnName],
          )
        ) {
          throw new TwentyOrmException(
            `Column "${columnName}" does not exist on "${this.options.tableShape.nameSingular}"`,
            TwentyOrmExceptionCode.UNKNOWN_COLUMN,
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

        const parameterName = `ormInsert_${parameterSequence++}`;

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

  private async assertRecordStockAvailable(quantity: number): Promise<void> {
    if (!isRecordStockTrackedObject(this.options.flatObjectMetadata)) {
      return;
    }

    await this.options.internalContext.recordStock.assertRecordStockAvailable({
      workspaceId: this.options.internalContext.workspaceId,
      quantity,
      flatObjectMetadataMaps:
        this.options.internalContext.flatObjectMetadataMaps,
    });
  }

  private async acquireRecordStock(quantity: number): Promise<void> {
    if (!isRecordStockTrackedObject(this.options.flatObjectMetadata)) {
      return;
    }

    await this.options.internalContext.recordStock.acquireRecordStock({
      workspaceId: this.options.internalContext.workspaceId,
      quantity,
    });
  }

  private async releaseRecordStock(quantity: number): Promise<void> {
    if (!isRecordStockTrackedObject(this.options.flatObjectMetadata)) {
      return;
    }

    await this.options.internalContext.recordStock.releaseRecordStock({
      workspaceId: this.options.internalContext.workspaceId,
      quantity,
    });
  }

  private async emitCreateEvents(insertedIds: string[]): Promise<void> {
    if (insertedIds.length === 0 || this.options.shouldSkipEventEmission) {
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

  async findRecordSnapshotsBypassingPermissions({
    ids,
    fieldNames,
  }: {
    ids: string[];
    fieldNames?: string[];
  }): Promise<ObjectRecord[]> {
    const queryBuilder = this.buildIdsEventSnapshotQueryBuilder(ids);

    if (!isDefined(fieldNames)) {
      return queryBuilder.getMany<ObjectRecord>({ noFormatting: true });
    }

    const { columnNames, columnShapeByColumnName } = this.options.tableShape;

    return queryBuilder
      .select(
        columnNames.filter((columnName) => {
          const columnShape = columnShapeByColumnName[columnName];

          return (
            columnName === 'id' ||
            columnName === 'deletedAt' ||
            (isDefined(columnShape) &&
              (fieldNames.includes(columnShape.fieldName) ||
                fieldNames.includes(
                  columnShape.compositeParentFieldName ?? '',
                )))
          );
        }),
      )
      .getMany<ObjectRecord>({ noFormatting: true });
  }

  private buildBypassingEventSelectQueryBuilder(
    alias: string,
  ): WorkspaceSelectQueryBuilder {
    return new WorkspaceSelectQueryBuilder(alias, {
      tableShape: this.options.tableShape,
      executor: this.options.executor,
      recordReadRestrictions: this.recordReadRestrictions,
      featureFlagsMap: this.options.internalContext.featureFlagsMap,
      tableShapeByObjectMetadataId: this.options.tableShapeByObjectMetadataId,
      onBeforeExecute: () => undefined,
      formatResult: (records) => this.formatResult(records),
    });
  }

  private buildIdsEventSnapshotQueryBuilder(
    ids: string[],
  ): WorkspaceSelectQueryBuilder {
    return this.buildBypassingEventSelectQueryBuilder(
      this.options.tableShape.nameSingular,
    )
      .where({ id: In(ids) })
      .withDeleted();
  }

  private async resolveWritableRecordIds({
    ids,
    operationType,
  }: {
    ids: string[];
    operationType: ObjectRecordsOperationType;
  }): Promise<Set<string>> {
    if (this.options.shouldBypassPermissionChecks) {
      return new Set(ids);
    }

    const queryBuilder = this.createQueryBuilder()
      .where({ id: In(ids) })
      .withDeleted();

    await this.applyRowLevelPermissionPredicates(queryBuilder, operationType);
    queryBuilder.select(['id']);

    const rows = await queryBuilder.getMany<ObjectRecord>({
      noFormatting: true,
    });

    return new Set(rows.map((row) => String(row.id)));
  }

  async runMutation(args: {
    selectQueryBuilder: WorkspaceSelectQueryBuilder;
    rowLevelPermissionsApplied: boolean;
    kind: MutationKind;
    columnsToReturn: string[];
    data?: Partial<ObjectRecord>;
  }): Promise<ObjectRecord[]> {
    if (args.kind !== 'update') {
      return this.performMutation(args);
    }

    return this.runWithValidationRules({
      write: (repository, writtenRecordsValidator) =>
        repository.performMutation({
          ...args,
          selectQueryBuilder:
            repository === this
              ? args.selectQueryBuilder
              : args.selectQueryBuilder.clone(repository.options.executor),
          writtenRecordsValidator,
        }),
    });
  }

  private async performMutation({
    selectQueryBuilder,
    rowLevelPermissionsApplied,
    kind,
    columnsToReturn,
    data,
    writtenRecordsValidator,
  }: {
    selectQueryBuilder: WorkspaceSelectQueryBuilder;
    rowLevelPermissionsApplied: boolean;
    kind: MutationKind;
    columnsToReturn: string[];
    data?: Partial<ObjectRecord>;
    writtenRecordsValidator?: WrittenRecordsValidator;
  }): Promise<ObjectRecord[]> {
    await this.validateWriteIsPermitted({
      operationType: OPERATION_TYPE_BY_MUTATION_KIND[kind],
      columnsToReturn,
      updatedColumns: isDefined(data)
        ? Object.keys(this.formatWriteData(data)).filter(
            (column) => column !== 'id',
          )
        : [],
    });

    if (!rowLevelPermissionsApplied) {
      await this.applyRowLevelPermissionPredicates(
        selectQueryBuilder,
        OPERATION_TYPE_BY_MUTATION_KIND[kind],
      );
    }

    const canSkipBeforeImage =
      this.options.shouldBypassPermissionChecks &&
      this.options.shouldSkipEventEmission &&
      !writtenRecordsValidator?.shouldReadRecordsBeforeWrite &&
      !(
        kind === 'update' &&
        isDefined(data) &&
        this.filesFieldSync.isUpdatingFilesField(
          data,
          this.options.flatObjectMetadata.id,
        )
      ) &&
      !(await this.options.internalContext.recordAccessGroupWrite.isRecordsBeforeWriteRequired(
        this.buildRecordAccessGroupWriteTarget(),
      ));

    const eventSelectQueryBuilder =
      this.buildEventSnapshotQueryBuilder(selectQueryBuilder);

    if (writtenRecordsValidator?.shouldReadRecordsBeforeWrite) {
      eventSelectQueryBuilder.forUpdate();
    }

    const recordsBefore = canSkipBeforeImage
      ? []
      : await eventSelectQueryBuilder.getMany<ObjectRecord>({
          noFormatting: true,
        });

    if (kind === 'update' && recordsBefore.length > QUERY_MAX_RECORDS) {
      throw new TwentyOrmException(
        `Cannot update more than ${QUERY_MAX_RECORDS} records at once`,
        TwentyOrmExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        {
          userFriendlyMessage: msg`You can only update up to ${QUERY_MAX_RECORDS} records at once.`,
        },
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

    let setColumns: Record<string, unknown> | undefined;

    if (kind === 'update' && isDefined(dataToWrite)) {
      const { id: _id, ...columns } = this.formatWriteData(dataToWrite);

      setColumns = columns;
    }

    if (kind === 'update' && isDefined(setColumns)) {
      await this.validateRLSPredicatesForUpdatedRecords(
        recordsBefore.map((rawRecordBefore) => ({
          rawRecordBefore,
          setColumns,
        })),
      );
    }

    const relatedRecordsBeforeDelete =
      kind === 'delete'
        ? await this.options.internalContext.recordAccessGroupWrite.findRelatedRecordsBeforeDelete(
            {
              ...this.buildRecordAccessGroupWriteTarget(),
              recordIds: recordsBefore
                .map((recordBefore) => recordBefore.id)
                .filter(isNonEmptyString),
              recordsBefore,
              transactionScope: this.buildRecordPermissionTransactionScope(),
            },
          )
        : undefined;

    const mutationResult = await this.morphAndExecute({
      selectQueryBuilder,
      kind,
      columnsToReturn:
        kind === 'update'
          ? getUpdateEventColumnsToReturn(
              columnsToReturn,
              this.options.tableShape,
            )
          : columnsToReturn,
      setColumns,
    });

    if (kind === 'delete') {
      await this.releaseRecordStock(mutationResult.generatedMaps.length);
    }

    if (isDefined(writtenRecordsValidator)) {
      await writtenRecordsValidator.validate({
        writtenRecords: mutationResult.generatedMaps,
        recordsBeforeWrite: writtenRecordsValidator.shouldReadRecordsBeforeWrite
          ? this.formatResult<ObjectRecord[]>(recordsBefore)
          : [],
      });
    }

    await this.recomputeRecordAccessGroupIdsAfterWrite({
      writtenRecordIds: mutationResult.generatedMaps
        .map((record) => record.id)
        .filter(isNonEmptyString),
      isRecomputingWrittenRecords: kind === 'update',
      recordsBefore,
      updatedColumnNames: isDefined(setColumns)
        ? Object.keys(setColumns)
        : undefined,
      relatedRecordsBeforeDelete,
    });

    if (isDefined(filesFieldFileIds)) {
      await this.filesFieldSync.updateFileEntityRecords(filesFieldFileIds);
    }

    const recordsAfterWrite =
      kind === 'delete' || this.options.shouldSkipEventEmission
        ? undefined
        : await eventSelectQueryBuilder.getMany<ObjectRecord>({
            noFormatting: true,
          });

    const recordsAfter =
      kind === 'update' && isDefined(setColumns)
        ? mergeReturnedUpdateTimestamps(
            mergeRecordsWithUpdateValues(
              getUpdateEventRecords(recordsBefore, recordsAfterWrite ?? []),
              setColumns,
            ),
            mutationResult.generatedMaps,
          )
        : recordsAfterWrite;

    this.emitMutationEvent({
      kind,
      recordsBefore,
      recordsAfter,
    });

    return mutationResult.generatedMaps;
  }

  private async morphAndExecute({
    selectQueryBuilder,
    kind,
    columnsToReturn,
    setColumns,
  }: {
    selectQueryBuilder: WorkspaceSelectQueryBuilder;
    kind: MutationKind;
    columnsToReturn: string[];
    setColumns?: Record<string, unknown>;
  }): Promise<{ generatedMaps: ObjectRecord[] }> {
    const mutationQueryBuilder =
      WorkspaceSelectQueryBuilder.toMutationQueryBuilder(
        selectQueryBuilder,
        kind,
      );

    if (kind === 'update') {
      mutationQueryBuilder.set(setColumns ?? {});
    }

    return mutationQueryBuilder.returning(columnsToReturn).execute();
  }

  private buildEventSnapshotQueryBuilder(
    source: WorkspaceSelectQueryBuilder,
  ): WorkspaceSelectQueryBuilder {
    return this.buildBypassingEventSelectQueryBuilder(source.alias)
      .copyWhereFrom(source)
      .withDeleted();
  }

  async validateWriteIsPermitted({
    operationType,
    columnsToReturn,
    updatedColumns,
  }: {
    operationType: Exclude<ObjectRecordsOperationType, 'read'>;
    columnsToReturn: string[];
    updatedColumns: string[];
  }): Promise<void> {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    await this.options.internalContext.recordPermissions.assertCanRunOperationOrThrow(
      {
        principals: this.resolvePermissionsPrincipalsOrThrow(),
        objectMetadataId: this.options.flatObjectMetadata.id,
        operationType,
        selectedColumns: columnsToReturn,
        updatedColumns,
      },
    );
  }

  private async validateRLSPredicatesForUpdatedRecords(
    updates: {
      rawRecordBefore: ObjectRecord;
      setColumns: Record<string, unknown>;
    }[],
  ): Promise<void> {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    await this.options.internalContext.recordPermissions.assertUpdatesKeepRecordAccessOrThrow(
      {
        principals: this.resolvePermissionsPrincipalsOrThrow(),
        objectMetadataId: this.options.flatObjectMetadata.id,
        updates,
        formatRecords: (rawRecords) =>
          this.formatResult<ObjectRecord[]>(rawRecords),
        transactionScope: this.buildRecordPermissionTransactionScope(),
      },
    );
  }

  private async recomputeRecordAccessGroupIdsAfterWrite(args: {
    writtenRecordIds: string[];
    isRecomputingWrittenRecords: boolean;
    recordsBefore: ObjectRecord[];
    updatedColumnNames?: string[];
    relatedRecordsBeforeDelete?: RelatedRecords[];
  }): Promise<void> {
    const { recordAccessGroupWrite, recordAccessGroupQueue, workspaceId } =
      this.options.internalContext;

    await recordAccessGroupQueue.queueRecompute({
      workspaceId,
      recordsToQueue: await recordAccessGroupWrite.recomputeAfterWrite({
        ...this.buildRecordAccessGroupWriteTarget(),
        ...args,
        transactionScope: this.buildRecordPermissionTransactionScope(),
      }),
    });
  }

  private buildRecordAccessGroupWriteTarget() {
    return {
      featureFlagsMap: this.options.internalContext.featureFlagsMap,
      workspaceId: this.options.internalContext.workspaceId,
      objectMetadataId: this.options.flatObjectMetadata.id,
    };
  }

  private buildRecordPermissionTransactionScope(): RecordPermissionTransactionScope {
    return {
      workspaceId: this.options.internalContext.workspaceId,
      executeRawQuery: (sql, parameters = []) =>
        this.options.executor.execute({ text: sql, values: parameters }),
    };
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
    if (this.options.shouldSkipEventEmission) {
      return;
    }

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

  private async onBeforeExecute(
    queryBuilder: WorkspaceSelectQueryBuilder,
  ): Promise<void> {
    await this.applyRowLevelPermissionPredicates(queryBuilder);
    await this.validateQueryIsPermitted(queryBuilder);
    await this.nullifyRlsRuleUnreadableFields(queryBuilder);
  }

  private async nullifyRlsRuleUnreadableFields(
    queryBuilder: WorkspaceSelectQueryBuilder,
  ): Promise<void> {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    const aliases = [
      { alias: queryBuilder.alias, tableShape: this.options.tableShape },
      ...queryBuilder.getJoinAliases().map(({ name }) => ({
        alias: name,
        tableShape: queryBuilder.getJoinedTableShape(name),
      })),
    ];

    for (const { alias, tableShape } of aliases) {
      if (
        !isDefined(tableShape) ||
        !queryBuilder.markColumnNullifyApplied(alias)
      ) {
        continue;
      }

      const unreadableFieldsSQLConditions =
        await this.options.internalContext.recordFieldPermissions.buildUnreadableFieldsSQLConditions(
          {
            principals: this.resolvePermissionsPrincipalsOrThrow(),
            objectMetadataId: tableShape.objectMetadataId,
            tableAlias: alias,
          },
        );

      if (!isNonEmptyArray(unreadableFieldsSQLConditions)) {
        continue;
      }

      const columnEntries = Object.entries(
        getColumnNameToFieldMetadataIdMap(
          this.options.flatObjectMetadataByObjectMetadataId(
            tableShape.objectMetadataId,
          ),
          this.options.internalContext.flatFieldMetadataMaps,
        ),
      );

      for (const {
        fieldMetadataIds,
        sqlCondition,
      } of unreadableFieldsSQLConditions) {
        queryBuilder.nullifyColumnsWhen({
          alias,
          columnNames: columnEntries
            .filter(([, fieldMetadataId]) =>
              fieldMetadataIds.includes(fieldMetadataId),
            )
            .map(([columnName]) => columnName),
          condition: sqlCondition,
        });
      }
    }
  }

  private async validateQueryIsPermitted(
    queryBuilder: WorkspaceSelectQueryBuilder,
  ): Promise<void> {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    for (const [alias, columnNames] of Object.entries(columnNamesByAlias)) {
      const tableShape =
        alias === queryBuilder.alias
          ? this.options.tableShape
          : queryBuilder.getJoinedTableShape(alias);

      if (!isDefined(tableShape)) {
        continue;
      }

      const question = {
        principals: this.resolvePermissionsPrincipalsOrThrow(),
        objectMetadataId: tableShape.objectMetadataId,
      };

      // A disabled main alias has already thrown, and a disabled join reads as empty
      if (
        await this.options.internalContext.recordPermissions.isReadDisabled(
          question,
        )
      ) {
        continue;
      }

      await this.options.internalContext.recordPermissions.assertCanRunOperationOrThrow(
        {
          ...question,
          operationType: 'read',
          selectedColumns: columnNames,
        },
      );
    }
  }

  private async applyRowLevelPermissionPredicates(
    queryBuilder: WorkspaceSelectQueryBuilder,
    operationType: ObjectRecordsOperationType = 'read',
  ): Promise<void> {
    if (this.options.shouldBypassPermissionChecks) {
      return;
    }

    await this.applyRowLevelPermissionPredicateForAlias({
      queryBuilder,
      alias: queryBuilder.alias,
      flatObjectMetadata: this.options.flatObjectMetadata,
      operationType,
    });

    for (const joinAlias of queryBuilder.getJoinAliases()) {
      const joinedTableShape = queryBuilder.getJoinedTableShape(joinAlias.name);

      if (!isDefined(joinedTableShape)) {
        continue;
      }

      await this.applyRowLevelPermissionPredicateForAlias({
        queryBuilder,
        alias: joinAlias.name,
        flatObjectMetadata: this.options.flatObjectMetadataByObjectMetadataId(
          joinedTableShape.objectMetadataId,
        ),
        operationType: 'read',
      });
    }
  }

  private async applyRowLevelPermissionPredicateForAlias({
    queryBuilder,
    alias,
    flatObjectMetadata,
    operationType,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    alias: string;
    flatObjectMetadata: FlatObjectMetadata;
    operationType: ObjectRecordsOperationType;
  }): Promise<void> {
    if (!queryBuilder.markRowLevelPermissionApplied(alias)) {
      return;
    }

    const condition = await this.buildPermissionsConditionForAlias({
      alias,
      isMainAlias: alias === queryBuilder.alias,
      flatObjectMetadata,
      operationType,
    });

    if (condition === true) {
      return;
    }

    if (condition === false) {
      this.denyAccessForAlias({
        queryBuilder,
        alias,
        flatObjectMetadata,
        operationType,
      });

      return;
    }

    this.addConditionForAlias({ queryBuilder, alias, ...condition });
  }

  private async buildPermissionsConditionForAlias({
    alias,
    isMainAlias,
    flatObjectMetadata,
    operationType,
  }: {
    alias: string;
    isMainAlias: boolean;
    flatObjectMetadata: FlatObjectMetadata;
    operationType: ObjectRecordsOperationType;
  }): Promise<SQLCondition | boolean> {
    if (isMainAlias) {
      await this.options.internalContext.recordPermissions.assertCanRunOperationOrThrow(
        {
          principals: this.resolvePermissionsPrincipalsOrThrow(),
          objectMetadataId: flatObjectMetadata.id,
          operationType,
          selectedColumns: [],
        },
      );
    }

    const { recordPermissions } = this.options.internalContext;
    const principals = this.resolvePermissionsPrincipalsOrThrow();

    if (operationType === 'read') {
      return recordPermissions.buildReadRecordsAccessSQLCondition({
        principals,
        objectMetadataId: flatObjectMetadata.id,
        tableAlias: alias,
      });
    }

    return recordPermissions.buildWriteRecordsAccessSQLCondition({
      principals,
      objectMetadataId: flatObjectMetadata.id,
      operationType,
      tableAlias: alias,
    });
  }

  async isReadDisabled(): Promise<boolean> {
    if (this.options.shouldBypassPermissionChecks) {
      return false;
    }

    return this.options.internalContext.recordPermissions.isReadDisabled({
      principals: this.resolvePermissionsPrincipalsOrThrow(),
      objectMetadataId: this.options.flatObjectMetadata.id,
    });
  }

  private resolvePermissionsPrincipalsOrThrow(): PermissionsPrincipalsWithRolesContext {
    const { permissionsPrincipals } = this.options;

    if (!isDefined(permissionsPrincipals)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return permissionsPrincipals;
  }

  private getTableExpression(objectMetadataId: string): string {
    const tableShape =
      this.options.tableShapeByObjectMetadataId(objectMetadataId);

    return `${escapeIdentifier(tableShape.schemaName)}.${escapeIdentifier(
      tableShape.tableName,
    )}`;
  }

  private denyAccessForAlias({
    queryBuilder,
    alias,
    flatObjectMetadata,
    operationType,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    alias: string;
    flatObjectMetadata: FlatObjectMetadata;
    operationType: ObjectRecordsOperationType;
  }): void {
    if (alias === queryBuilder.alias) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.PERMISSION_DENIED}: records of "${flatObjectMetadata.nameSingular}" are not ${operationType === 'read' ? 'readable' : 'writable'} through the API`,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    queryBuilder.addJoinCondition(alias, ALWAYS_FALSE_CONDITION);
  }

  private addConditionForAlias({
    queryBuilder,
    alias,
    sql,
    parameters,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    alias: string;
    sql: string;
    parameters: ObjectLiteral;
  }): void {
    if (alias === queryBuilder.alias) {
      queryBuilder.addRowAccessCondition(sql, parameters);

      return;
    }

    queryBuilder.addJoinCondition(alias, sql);
    queryBuilder.setParameters(parameters);
  }
}
