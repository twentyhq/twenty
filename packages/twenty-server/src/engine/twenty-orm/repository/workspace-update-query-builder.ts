import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  EntityTarget,
  ObjectLiteral,
  UpdateQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { RelationDisconnectQueryFieldsByEntityIndex } from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { RelationNestedQueries } from 'src/engine/twenty-orm/relation-nested-queries/relation-nested-queries';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceUpdateQueryBuilder<
  T extends ObjectLiteral,
> extends UpdateQueryBuilder<T> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext?: AuthContext;
  private featureFlagMap?: FeatureFlagMap;
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
    objectRecordsPermissions: ObjectRecordsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
    authContext?: AuthContext,
    featureFlagMap?: FeatureFlagMap,
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

    return new WorkspaceUpdateQueryBuilder(
      clonedQueryBuilder as UpdateQueryBuilder<T>,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;
  }

  override async execute(): Promise<UpdateResult> {
    try {
      if (this.manyInputs) {
        return this.executeMany();
      }

      validateQueryIsPermittedOrThrow({
        expressionMap: this.expressionMap,
        objectRecordsPermissions: this.objectRecordsPermissions,
        objectMetadataMaps: this.internalContext.objectMetadataMaps,
        shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
        isFieldPermissionsEnabled:
          this.featureFlagMap?.[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED],
      });

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const eventSelectQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        true,
        this.authContext,
        this.featureFlagMap,
      );

      eventSelectQueryBuilder.expressionMap.wheres = this.expressionMap.wheres;
      eventSelectQueryBuilder.expressionMap.aliases =
        this.expressionMap.aliases;
      eventSelectQueryBuilder.setParameters(this.getParameters());

      const before = await eventSelectQueryBuilder.getMany();

      const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        this.shouldBypassPermissionChecks,
        this.authContext,
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
        this.internalContext.objectMetadataMaps,
      );

      const result = await super.execute();
      const after = await eventSelectQueryBuilder.getMany();

      const formattedAfter = formatResult<T[]>(
        after,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      await this.internalContext.eventEmitterService.emitMutationEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadataItem: objectMetadata,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedAfter,
        beforeEntities: formattedBefore,
        authContext: this.authContext,
      });

      const formattedResult = formatResult<T[]>(
        result.raw,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return {
        raw: result.raw,
        generatedMaps: formattedResult,
        affected: result.affected,
      };
    } catch (error) {
      throw computeTwentyORMException(error);
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
          objectRecordsPermissions: this.objectRecordsPermissions,
          objectMetadataMaps: this.internalContext.objectMetadataMaps,
          shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
          isFieldPermissionsEnabled:
            this.featureFlagMap?.[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED],
        });
      }

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const eventSelectQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        true,
        this.authContext,
        this.featureFlagMap,
      );

      eventSelectQueryBuilder.whereInIds(
        this.manyInputs.map((input) => input.criteria),
      );
      eventSelectQueryBuilder.expressionMap.aliases =
        this.expressionMap.aliases;
      eventSelectQueryBuilder.setParameters(this.getParameters());

      const beforeRecords = await eventSelectQueryBuilder.getMany();

      const formattedBefore = formatResult<T[]>(
        beforeRecords,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      const results: UpdateResult[] = [];

      for (const input of this.manyInputs) {
        this.expressionMap.valuesSet = input.partialEntity;
        this.where({ id: input.criteria });

        const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
          this as unknown as WorkspaceSelectQueryBuilder<T>,
          this.objectRecordsPermissions,
          this.internalContext,
          this.shouldBypassPermissionChecks,
          this.authContext,
        );

        if (isDefined(this.relationNestedConfig)) {
          const updatedValues =
            await this.relationNestedQueries.processRelationNestedQueries({
              entities: input.partialEntity as
                | QueryDeepPartialEntityWithNestedRelationFields<T>
                | QueryDeepPartialEntityWithNestedRelationFields<T>[],
              relationNestedConfig: this.relationNestedConfig,
              queryBuilder: nestedRelationQueryBuilder,
            });

          this.expressionMap.valuesSet =
            updatedValues.length === 1 ? updatedValues[0] : updatedValues;
        }

        const result = await super.execute();

        results.push(result);
      }

      const afterRecords = await eventSelectQueryBuilder.getMany();

      const formattedAfter = formatResult<T[]>(
        afterRecords,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      await this.internalContext.eventEmitterService.emitMutationEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadataItem: objectMetadata,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedAfter,
        beforeEntities: formattedBefore,
        authContext: this.authContext,
      });

      const formattedResults = formatResult<T[]>(
        results.map((result) => result.raw),
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return {
        raw: results.map((result) => result.raw),
        generatedMaps: formattedResults,
        affected: results.length,
      };
    } catch (error) {
      throw computeTwentyORMException(error);
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

    const formattedUpdateSet = formatData(_values, objectMetadata);

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
    this.manyInputs = inputs;

    return this;
  }
}
