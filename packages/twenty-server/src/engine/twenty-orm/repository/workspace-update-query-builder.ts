import { msg } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  UpdateQueryBuilder,
  type EntityTarget,
  type ObjectLiteral,
  type UpdateResult,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type WhereClause } from 'typeorm/query-builder/WhereClause';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { type RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { type RelationDisconnectQueryFieldsByEntityIndex } from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { RelationNestedQueries } from 'src/engine/twenty-orm/relation-nested-queries/relation-nested-queries';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { applyRowLevelPermissionPredicates } from 'src/engine/twenty-orm/utils/apply-row-level-permission-predicates.util';
import { applyTableAliasOnWhereCondition } from 'src/engine/twenty-orm/utils/apply-table-alias-on-where-condition';
import { computeEventSelectQueryBuilder } from 'src/engine/twenty-orm/utils/compute-event-select-query-builder.util';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export class WorkspaceUpdateQueryBuilder<
  T extends ObjectLiteral,
> extends UpdateQueryBuilder<T> {
  private objectRecordsPermissions: ObjectsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext: AuthContext;
  private featureFlagMap: FeatureFlagMap;
  private relationNestedQueries: RelationNestedQueries;
  private relationNestedConfig:
    | [RelationConnectQueryConfig[], RelationDisconnectQueryFieldsByEntityIndex]
    | null;
  private manyInputs: {
    criteria: string;
    partialEntity: QueryDeepPartialEntity<T>;
  }[];

  constructor(
    queryBuilder: UpdateQueryBuilder<T>,
    objectRecordsPermissions: ObjectsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
    authContext: AuthContext,
    featureFlagMap: FeatureFlagMap,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.authContext = authContext;
    this.featureFlagMap = featureFlagMap;
    this.relationNestedQueries = new RelationNestedQueries(
      this.internalContext,
    );
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    const workspaceUpdateQueryBuilder = new WorkspaceUpdateQueryBuilder(
      clonedQueryBuilder as UpdateQueryBuilder<T>,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;

    return workspaceUpdateQueryBuilder;
  }

  override async execute(): Promise<UpdateResult> {
    try {
      if (this.manyInputs) {
        return this.executeMany();
      }
      validateQueryIsPermittedOrThrow({
        expressionMap: this.expressionMap,
        objectsPermissions: this.objectRecordsPermissions,
        flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
        shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      });

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const eventSelectQueryBuilder = computeEventSelectQueryBuilder<T>({
        queryBuilder: this,
        authContext: this.authContext,
        internalContext: this.internalContext,
        featureFlagMap: this.featureFlagMap,
        expressionMap: this.expressionMap,
        objectRecordsPermissions: this.objectRecordsPermissions,
      });

      const tableName = computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      );

      const before = await eventSelectQueryBuilder.getMany();

      if (before.length > QUERY_MAX_RECORDS) {
        throw new TwentyORMException(
          `Cannot update more than ${QUERY_MAX_RECORDS} records at once`,
          TwentyORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
          {
            userFriendlyMessage: msg`You can only update up to ${QUERY_MAX_RECORDS} records at once.`,
          },
        );
      }

      this.expressionMap.wheres = applyTableAliasOnWhereCondition({
        condition: this.expressionMap.wheres,
        tableName,
        aliasName: objectMetadata.nameSingular,
      }) as WhereClause[];

      const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        this.shouldBypassPermissionChecks,
        this.authContext,
        this.featureFlagMap,
      );

      if (isDefined(this.relationNestedConfig)) {
        const updatedValues =
          await this.relationNestedQueries.processRelationNestedQueries({
            entities: this.expressionMap.valuesSet as
              | QueryDeepPartialEntityWithNestedRelationFields<T>
              | QueryDeepPartialEntityWithNestedRelationFields<T>[],
            relationNestedConfig: this.relationNestedConfig,
            queryBuilder: nestedRelationQueryBuilder,
          });

        this.expressionMap.valuesSet =
          updatedValues.length === 1 ? updatedValues[0] : updatedValues;
      }

      const formattedBefore = formatResult<T[]>(
        before,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      this.applyRowLevelPermissionPredicates();

      const result = await super.execute();

      const after = await eventSelectQueryBuilder.getMany();

      const formattedAfter = formatResult<T[]>(
        after,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPDATED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedAfter,
          beforeEntities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPSERTED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedAfter,
          beforeEntities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      const formattedResult = formatResult<T[]>(
        result.raw,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return {
        raw: result.raw,
        generatedMaps: formattedResult,
        affected: result.affected,
      };
    } catch (error) {
      const objectMetadata = getObjectMetadataFromEntityTarget(
        this.getMainAliasTarget(),
        this.internalContext,
      );

      throw await computeTwentyORMException(
        error,
        objectMetadata,
        this.connection.manager as WorkspaceEntityManager,
        this.internalContext,
      );
    }
  }

  public async executeMany(): Promise<UpdateResult> {
    try {
      for (const input of this.manyInputs) {
        const fakeExpressionMapToValidatePermissions = Object.assign(
          {},
          this.expressionMap,
          {
            wheres: input.criteria,
            valuesSet: input.partialEntity,
          },
        );

        validateQueryIsPermittedOrThrow({
          expressionMap: fakeExpressionMapToValidatePermissions,
          objectsPermissions: this.objectRecordsPermissions,
          flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
          shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
        });
      }

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const eventSelectQueryBuilder = computeEventSelectQueryBuilder<T>({
        queryBuilder: this,
        authContext: this.authContext,
        internalContext: this.internalContext,
        featureFlagMap: this.featureFlagMap,
        expressionMap: this.expressionMap,
        objectRecordsPermissions: this.objectRecordsPermissions,
      });

      eventSelectQueryBuilder.whereInIds(
        this.manyInputs.map((input) => input.criteria),
      );

      const beforeRecords = await eventSelectQueryBuilder.getMany();

      const formattedBefore = formatResult<T[]>(
        beforeRecords,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      const results: UpdateResult[] = [];

      const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        this.shouldBypassPermissionChecks,
        this.authContext,
        this.featureFlagMap,
      );

      this.relationNestedConfig =
        this.relationNestedQueries.prepareNestedRelationQueries(
          this.manyInputs.map(
            (input) => input.partialEntity,
          ) as QueryDeepPartialEntityWithNestedRelationFields<T>[],
          mainAliasTarget,
        );

      if (isDefined(this.relationNestedConfig)) {
        const updatedValues =
          await this.relationNestedQueries.processRelationNestedQueries({
            entities: this.manyInputs.map((input) => input.partialEntity) as
              | QueryDeepPartialEntityWithNestedRelationFields<T>
              | QueryDeepPartialEntityWithNestedRelationFields<T>[],
            relationNestedConfig: this.relationNestedConfig,
            queryBuilder: nestedRelationQueryBuilder,
          });

        this.manyInputs = updatedValues.map((updatedValue, index) => ({
          criteria: this.manyInputs[index].criteria,
          partialEntity: updatedValue,
        }));
      }

      for (const input of this.manyInputs) {
        this.expressionMap.valuesSet = input.partialEntity;
        this.where({ id: input.criteria });

        this.applyRowLevelPermissionPredicates();

        const result = await super.execute();

        results.push(result);
      }

      const afterRecords = await eventSelectQueryBuilder.getMany();

      const formattedAfter = formatResult<T[]>(
        afterRecords,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPDATED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedAfter,
          beforeEntities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPSERTED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedAfter,
          beforeEntities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      const formattedResults = formatResult<T[]>(
        results.flatMap((result) => result.raw),
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return {
        raw: results.flatMap((result) => result.raw),
        generatedMaps: formattedResults,
        affected: results.length,
      };
    } catch (error) {
      const objectMetadata = getObjectMetadataFromEntityTarget(
        this.getMainAliasTarget(),
        this.internalContext,
      );

      throw await computeTwentyORMException(
        error,
        objectMetadata,
        this.connection.manager as WorkspaceEntityManager,
        this.internalContext,
      );
    }
  }

  override set(
    _values:
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[],
  ): this;

  override set(_values: QueryDeepPartialEntity<T>): this;

  override set(
    _values:
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[]
      | QueryDeepPartialEntity<T>
      | QueryDeepPartialEntity<T>[],
  ): this {
    const mainAliasTarget = this.getMainAliasTarget();

    const objectMetadata = getObjectMetadataFromEntityTarget(
      mainAliasTarget,
      this.internalContext,
    );

    const extendedValues = _values as
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[];

    this.relationNestedConfig =
      this.relationNestedQueries.prepareNestedRelationQueries(
        extendedValues,
        mainAliasTarget,
      );

    const formattedUpdateSet = formatData(
      _values,
      objectMetadata,
      this.internalContext.flatFieldMetadataMaps,
    );

    return super.set(formattedUpdateSet as QueryDeepPartialEntity<T>);
  }

  override select(): WorkspaceSelectQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a select builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a delete builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a soft delete builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a soft delete builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  private getMainAliasTarget(): EntityTarget<T> {
    const mainAliasTarget = this.expressionMap.mainAlias?.target;

    if (!mainAliasTarget) {
      throw new TwentyORMException(
        'Main alias target is missing',
        TwentyORMExceptionCode.MISSING_MAIN_ALIAS_TARGET,
      );
    }

    return mainAliasTarget;
  }

  public setManyInputs(
    inputs: {
      criteria: string;
      partialEntity: QueryDeepPartialEntity<T>;
    }[],
  ): this {
    const mainAliasTarget = this.getMainAliasTarget();

    const objectMetadata = getObjectMetadataFromEntityTarget(
      mainAliasTarget,
      this.internalContext,
    );

    this.manyInputs = inputs.map((input) => ({
      criteria: input.criteria,
      partialEntity: formatData(
        input.partialEntity,
        objectMetadata,
        this.internalContext.flatFieldMetadataMaps,
      ),
    }));

    return this;
  }

  private applyRowLevelPermissionPredicates(): void {
    if (this.shouldBypassPermissionChecks) {
      return;
    }

    const mainAliasTarget = this.getMainAliasTarget();

    const objectMetadata = getObjectMetadataFromEntityTarget(
      mainAliasTarget,
      this.internalContext,
    );

    applyRowLevelPermissionPredicates({
      queryBuilder: this as unknown as WorkspaceSelectQueryBuilder<T>,
      objectMetadata,
      internalContext: this.internalContext,
      authContext: this.authContext,
      featureFlagMap: this.featureFlagMap,
    });
  }
}
