import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ExecuteInWorkspaceContextOptions } from 'src/engine/twenty-orm/global-workspace-datasource/types/execute-in-workspace-context-options.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceDataSourceV2Service } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2.service';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDataSourceV2Service: WorkspaceDataSourceV2Service,
  ) {}

  async getRepository<T extends ObjectLiteral>(
    workspaceEntity: Type<T>,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepositoryV2<T>>;

  async getRepository<T extends ObjectLiteral>(
    objectMetadataName: string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepositoryV2<T>>;

  async getRepository<T extends ObjectLiteral>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepositoryV2<T>> {
    const objectMetadataName = this.resolveObjectMetadataName(
      workspaceEntityOrObjectMetadataName,
    );

    return this.workspaceDataSourceV2Service
      .getDataSource({ useReplica: false })
      .getRepository<T>(objectMetadataName, permissionOptions);
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
    return this.workspaceDataSourceV2Service
      .getDataSource({ useReplica: false })
      .transaction((transactionScope) =>
        work({
          getRepository: <T extends ObjectLiteral = ObjectRecord>(
            objectMetadataName: string,
            rolePermissionConfig?: RolePermissionConfig,
          ): WorkspaceRepositoryV2<T> =>
            transactionScope.getRepository(
              objectMetadataName,
              rolePermissionConfig,
            ) as unknown as WorkspaceRepositoryV2<T>,
          executeRawQuery: (sql, parameters) =>
            transactionScope.executeRawQuery(sql, parameters),
        }),
      );
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

    return withWorkspaceContext(context, fn);
  }

  private async loadWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      featureFlagsMap,
      rolesPermissions: permissionsPerRoleId,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'featureFlagsMap',
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
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      objectIdByNameSingular,
      featureFlagsMap,
      permissionsPerRoleId,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
    };
  }

  private async loadLiteWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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
      permissionsPerRoleId: {},
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    };
  }
}
