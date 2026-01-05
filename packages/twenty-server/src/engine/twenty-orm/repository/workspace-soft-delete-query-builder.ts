import { type ObjectsPermissions } from 'twenty-shared/types';
import {
  type EntityTarget,
  type InsertQueryBuilder,
  type ObjectLiteral,
  type UpdateResult,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { type WhereClause } from 'typeorm/query-builder/WhereClause';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';
import { applyRowLevelPermissionPredicates } from 'src/engine/twenty-orm/utils/apply-row-level-permission-predicates.util';
import { applyTableAliasOnWhereCondition } from 'src/engine/twenty-orm/utils/apply-table-alias-on-where-condition';
import { computeEventSelectQueryBuilder } from 'src/engine/twenty-orm/utils/compute-event-select-query-builder.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export class WorkspaceSoftDeleteQueryBuilder<
  T extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<T> {
  private objectRecordsPermissions: ObjectsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext: AuthContext;
  private featureFlagMap: FeatureFlagMap;

  constructor(
    queryBuilder: SoftDeleteQueryBuilder<T>,
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
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    const workspaceSoftDeleteQueryBuilder = new WorkspaceSoftDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;

    return workspaceSoftDeleteQueryBuilder;
  }

  override async execute(): Promise<UpdateResult> {
    try {
      this.applyRowLevelPermissionPredicates();
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

      const beforeEventSelectQueryBuilder = computeEventSelectQueryBuilder<T>({
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

      const before = await beforeEventSelectQueryBuilder.getMany();

      this.expressionMap.wheres = applyTableAliasOnWhereCondition({
        condition: this.expressionMap.wheres,
        tableName,
        aliasName: objectMetadata.nameSingular,
      }) as WhereClause[];

      const after = await super.execute();

      const formattedAfter = formatResult<T[]>(
        after.raw,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      const formattedBefore = formatResult<T[]>(
        before,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.DELETED,
          objectMetadataItem: objectMetadata,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      return {
        raw: after.raw,
        generatedMaps: formattedAfter,
        affected: after.affected,
      };
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
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

  override insert(): InsertQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into an insert builder',
      TwentyORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    throw new TwentyORMException(
      'This builder cannot morph into a delete builder',
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
