import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type EntityTarget,
  InsertQueryBuilder,
  type InsertResult,
  type ObjectLiteral,
} from 'typeorm';

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
import { type WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceInsertQueryBuilder<
  T extends ObjectLiteral,
> extends InsertQueryBuilder<T> {
  private objectRecordsPermissions: ObjectsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext: AuthContext;
  private featureFlagMap: FeatureFlagMap;
  private relationNestedQueries: RelationNestedQueries;
  private relationNestedConfig:
    | [RelationConnectQueryConfig[], RelationDisconnectQueryFieldsByEntityIndex]
    | null;

  constructor(
    queryBuilder: InsertQueryBuilder<T>,
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

    return new WorkspaceInsertQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;
  }

  override values(
    values:
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[],
  ): this {
    const mainAliasTarget = this.getMainAliasTarget();

    this.relationNestedConfig =
      this.relationNestedQueries.prepareNestedRelationQueries(
        values,
        mainAliasTarget,
      );

    const objectMetadata = getObjectMetadataFromEntityTarget(
      mainAliasTarget,
      this.internalContext,
    );

    const formattedValues = formatData(
      values,
      objectMetadata,
      this.internalContext.flatFieldMetadataMaps,
    );

    return super.values(formattedValues);
  }

  override async execute(): Promise<InsertResult> {
    try {
      validateQueryIsPermittedOrThrow({
        expressionMap: this.expressionMap,
        objectsPermissions: this.objectRecordsPermissions,
        flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
        shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      });

      // Fix overwrites for composite fields - valuesSet contains formatted/flattened column names
      // but overwrites was computed before formatData, missing composite field columns
      if (
        isDefined(this.expressionMap.onUpdate?.overwrite) &&
        isDefined(this.expressionMap.valuesSet)
      ) {
        const valuesArray = Array.isArray(this.expressionMap.valuesSet)
          ? this.expressionMap.valuesSet
          : [this.expressionMap.valuesSet];

        const allValueKeys = new Set(
          valuesArray.flatMap((value) => Object.keys(value)),
        );

        const mainAliasMetadata = this.expressionMap.mainAlias?.metadata;

        if (mainAliasMetadata) {
          const missingColumns = mainAliasMetadata.columns
            .filter(
              (col) =>
                allValueKeys.has(col.databaseName) &&
                !this.expressionMap.onUpdate.overwrite!.includes(
                  col.databaseName,
                ),
            )
            .map((col) => col.databaseName);

          this.expressionMap.onUpdate.overwrite = [
            ...this.expressionMap.onUpdate.overwrite,
            ...missingColumns,
          ];
        }
      }

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      if (isDefined(this.relationNestedConfig)) {
        const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
          this as unknown as WorkspaceSelectQueryBuilder<T>,
          this.objectRecordsPermissions,
          this.internalContext,
          this.shouldBypassPermissionChecks,
          this.authContext,
          this.featureFlagMap,
        );

        const updatedValues =
          await this.relationNestedQueries.processRelationNestedQueries({
            entities: this.expressionMap.valuesSet as
              | QueryDeepPartialEntityWithNestedRelationFields<T>
              | QueryDeepPartialEntityWithNestedRelationFields<T>[],
            relationNestedConfig: this.relationNestedConfig,
            queryBuilder: nestedRelationQueryBuilder,
          });

        this.expressionMap.valuesSet = updatedValues;
      }

      const result = await super.execute();
      const eventSelectQueryBuilder = (
        this.connection.manager as WorkspaceEntityManager
      ).createQueryBuilder(
        mainAliasTarget,
        this.expressionMap.mainAlias?.metadata.name ?? '',
        undefined,
        {
          shouldBypassPermissionChecks: true,
        },
      ) as WorkspaceSelectQueryBuilder<T>;

      eventSelectQueryBuilder.whereInIds(
        result.identifiers.map((identifier) => identifier.id),
      );

      const afterResult = await eventSelectQueryBuilder.getMany();

      const formattedResultForEvent = formatResult<T[]>(
        afterResult,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.CREATED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedResultForEvent,
          authContext: this.authContext,
        }),
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPSERTED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedResultForEvent,
          authContext: this.authContext,
        }),
      );

      // TypeORM returns all entity columns for insertions
      const resultWithoutInsertionExtraColumns = !isDefined(result.raw)
        ? []
        : result.raw.map((rawResult: Record<string, string>) =>
            Object.keys(rawResult)
              .filter(
                (key) =>
                  this.expressionMap.returning.includes(key) ||
                  this.expressionMap.returning === '*',
              )
              .reduce((filtered: Record<string, string>, key) => {
                filtered[key] = rawResult[key];

                return filtered;
              }, {}),
          );

      const formattedResult = formatResult<T[]>(
        resultWithoutInsertionExtraColumns,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return {
        raw: resultWithoutInsertionExtraColumns,
        generatedMaps: formattedResult,
        identifiers: result.identifiers,
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

  override select(): WorkspaceSelectQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a select builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override update(): WorkspaceUpdateQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into an update builder',
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

  setAuthContext(authContext: AuthContext): WorkspaceInsertQueryBuilder<T> {
    this.authContext = authContext;

    return this;
  }
}
