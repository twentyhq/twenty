import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ExecuteInWorkspaceContextOptions } from 'src/engine/twenty-orm/types/execute-in-workspace-context-options.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
  getWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class WorkspaceOrmManager {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly recordSharingFeatureService: RecordSharingFeatureService,
  ) {}

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    workspaceEntity: Type<T>,
    permissionOptions?: RolePermissionConfig,
    repositoryOptions?: {
      useReplica?: boolean;
      shouldSkipEventEmission?: boolean;
      shouldBypassValidationRules?: boolean;
    },
  ): WorkspaceRepository<T>;

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    objectMetadataName: string,
    permissionOptions?: RolePermissionConfig,
    repositoryOptions?: {
      useReplica?: boolean;
      shouldSkipEventEmission?: boolean;
      shouldBypassValidationRules?: boolean;
    },
  ): WorkspaceRepository<T>;

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
    repositoryOptions?: {
      useReplica?: boolean;
      shouldSkipEventEmission?: boolean;
      shouldBypassValidationRules?: boolean;
    },
  ): WorkspaceRepository<T> {
    const objectMetadataName = this.resolveObjectMetadataName(
      workspaceEntityOrObjectMetadataName,
    );

    return this.workspaceDataSourceService
      .getDataSource({ useReplica: repositoryOptions?.useReplica ?? false })
      .getRepository<T>(objectMetadataName, permissionOptions, {
        shouldSkipEventEmission:
          repositoryOptions?.shouldSkipEventEmission ?? false,
        shouldBypassValidationRules:
          repositoryOptions?.shouldBypassValidationRules ?? false,
      });
  }

  // Domain APIs must evaluate the same role intersection as ordinary record APIs.
  getRepositoryWithContextPermissions<
    TData extends ObjectLiteral = ObjectRecord,
  >(
    objectMetadataName: string,
    transactionScope?: WorkspaceTransactionScope,
  ): WorkspaceRepository<TData> {
    const context = getWorkspaceContext();
    const permissionConfig = resolveRolePermissionConfig(context);
    if (!isDefined(permissionConfig)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
    return isDefined(transactionScope)
      ? transactionScope.getRepository<TData>(
          objectMetadataName,
          permissionConfig,
        )
      : this.getRepository<TData>(objectMetadataName, permissionConfig);
  }

  private resolveObjectMetadataName<T extends ObjectLiteral>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
  ): string {
    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      return workspaceEntityOrObjectMetadataName;
    }

    return convertClassNameToObjectMetadataName(
      workspaceEntityOrObjectMetadataName.name,
    );
  }

  async runInWorkspaceTransaction<T>(
    work: (transactionScope: WorkspaceTransactionScope) => Promise<T>,
  ): Promise<T> {
    return this.workspaceDataSourceService
      .getDataSource({ useReplica: false })
      .transaction(work);
  }

  async executeInWorkspaceContext<T>(
    fn: () => T | Promise<T>,
    authContext?: WorkspaceAuthContext,
    options?: ExecuteInWorkspaceContextOptions,
  ): Promise<T> {
    const resolvedAuthContext = authContext ?? getWorkspaceAuthContext();
    const context = options?.lite
      ? await this.loadLiteWorkspaceContext(resolvedAuthContext)
      : await this.loadWorkspaceContext(resolvedAuthContext);

    return withWorkspaceContext(
      {
        ...context,
        isLegacyRecordAccessOpen:
          await this.recordSharingFeatureService.isLegacyRecordAccessOpen(
            resolvedAuthContext.workspace.id,
          ),
      },
      fn,
    );
  }

  private async loadWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      flatIndexMaps,
      featureFlagsMap,
      billingEntitlements,
      rolesPermissions: permissionsPerRoleId,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'flatIndexMaps',
      'featureFlagsMap',
      'billingEntitlements',
      'rolesPermissions',
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      flatIndexMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      objectIdByNameSingular,
      featureFlagsMap,
      billingEntitlements,
      permissionsPerRoleId,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
    };
  }

  private async loadLiteWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      billingEntitlements,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'billingEntitlements',
    ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      flatIndexMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      flatRowLevelPermissionPredicateMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      flatRowLevelPermissionPredicateGroupMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      objectIdByNameSingular,
      featureFlagsMap: {} as ORMWorkspaceContext['featureFlagsMap'],
      billingEntitlements,
      permissionsPerRoleId: {},
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    };
  }
}
