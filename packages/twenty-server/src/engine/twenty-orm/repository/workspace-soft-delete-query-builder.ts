import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  EntityTarget,
  InsertQueryBuilder,
  ObjectLiteral,
  UpdateResult,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceSoftDeleteQueryBuilder<
  T extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<T> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext?: AuthContext;
  private featureFlagMap?: FeatureFlagMap;

  constructor(
    queryBuilder: SoftDeleteQueryBuilder<T>,
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
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceSoftDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
    ) as this;
  }

  override async execute(): Promise<UpdateResult> {
    try {
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

      const after = await super.execute();

      const formattedAfter = formatResult<T[]>(
        after.raw,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      await this.internalContext.eventEmitterService.emitMutationEvent({
        action: DatabaseEventAction.DELETED,
        objectMetadataItem: objectMetadata,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedAfter,
        authContext: this.authContext,
      });

      return {
        raw: after.raw,
        generatedMaps: formattedAfter,
        affected: after.affected,
      };
    } catch (error) {
      throw computeTwentyORMException(error);
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
}
