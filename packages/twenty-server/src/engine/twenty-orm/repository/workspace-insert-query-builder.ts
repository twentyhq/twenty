import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  EntityTarget,
  InsertQueryBuilder,
  InsertResult,
  ObjectLiteral,
} from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';
import { RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { RelationDisconnectQueryFieldsByEntityIndex } from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { RelationNestedQueries } from 'src/engine/twenty-orm/relation-nested-queries/relation-nested-queries';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceInsertQueryBuilder<
  T extends ObjectLiteral,
> extends InsertQueryBuilder<T> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext?: AuthContext;
  private featureFlagMap?: FeatureFlagMap;
  private relationNestedQueries: RelationNestedQueries;
  private relationNestedConfig: [
    RelationConnectQueryConfig[],
    RelationDisconnectQueryFieldsByEntityIndex,
  ];

  constructor(
    queryBuilder: InsertQueryBuilder<T>,
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

    const formattedValues = formatData(values, objectMetadata);

    return super.values(formattedValues);
  }

  override async execute(): Promise<InsertResult> {
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

    const nestedRelationQueryBuilder = new WorkspaceSelectQueryBuilder(
      this as unknown as WorkspaceSelectQueryBuilder<T>,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
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

    const result = await super.execute();

    const formattedResult = formatResult<T[]>(
      result.raw,
      objectMetadata,
      this.internalContext.objectMetadataMaps,
    );

    await this.internalContext.eventEmitterService.emitMutationEvent({
      action: DatabaseEventAction.CREATED,
      objectMetadataItem: objectMetadata,
      workspaceId: this.internalContext.workspaceId,
      entities: formattedResult,
      authContext: this.authContext,
    });

    return {
      raw: result.raw,
      generatedMaps: formattedResult,
      identifiers: result.identifiers,
    };
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
}
