import { Injectable, type Type } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { ExecuteInWorkspaceContextOptions } from 'src/engine/twenty-orm/global-workspace-datasource/types/execute-in-workspace-context-options.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import type { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  getWorkspaceContext,
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceDataSourceV2Service } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDataSourceV2Service: WorkspaceDataSourceV2Service,
  ) {}

  async getRepository<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntity: Type<T>,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    _workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>> {
    const objectMetadataName = this.resolveObjectMetadataName(
      workspaceEntityOrObjectMetadataName,
    );

    if (await this.isOrmV2ReadPathEnabled()) {
      return this.workspaceDataSourceV2Service
        .getDataSource({ useReplica: false })
        .getRepository(
          objectMetadataName,
          permissionOptions,
        ) as unknown as WorkspaceRepository<T>;
    }

    const globalDataSource = await this.getGlobalWorkspaceDataSource();

    return globalDataSource.getRepository<T>(
      objectMetadataName,
      permissionOptions,
    );
  }

  async getGlobalWorkspaceDataSource(): Promise<GlobalWorkspaceDataSource> {
    return this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();
  }

  async getGlobalWorkspaceDataSourceReplica(): Promise<GlobalWorkspaceDataSource> {
    return this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSourceReplica();
  }

  async ensureEntityMetadatasLoaded(): Promise<void> {
    const context = getWorkspaceContext();

    if (context.entityMetadatas.length > 0) {
      return;
    }

    const { ORMEntityMetadatas } =
      await this.workspaceCacheService.getOrRecompute(
        context.authContext.workspace.id,
        ['ORMEntityMetadatas'],
      );

    context.entityMetadatas.push(...ORMEntityMetadatas);
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

  private async isOrmV2ReadPathEnabled(): Promise<boolean> {
    const context = getWorkspaceContext();
    const contextFlag =
      context.featureFlagsMap[FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED];

    if (isDefined(contextFlag)) {
      return contextFlag;
    }

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      context.authContext.workspace.id,
      ['featureFlagsMap'],
    );

    return featureFlagsMap[FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED] ?? false;
  }

  async runInWorkspaceTransaction<T>(
    work: (transactionScope: WorkspaceTransactionScope) => Promise<T>,
  ): Promise<T> {
    if (await this.isOrmV2ReadPathEnabled()) {
      return this.workspaceDataSourceV2Service
        .getDataSource({ useReplica: false })
        .transaction((transactionScope) =>
          work({
            getRepository: <Entity extends ObjectLiteral>(
              objectMetadataName: string,
              rolePermissionConfig?: RolePermissionConfig,
            ): WorkspaceRepository<Entity> =>
              transactionScope.getRepository(
                objectMetadataName,
                rolePermissionConfig,
              ) as unknown as WorkspaceRepository<Entity>,
            executeRawQuery: (sql, parameters) =>
              transactionScope.executeRawQuery(sql, parameters),
          }),
        );
    }

    await this.ensureEntityMetadatasLoaded();

    const { authContext } = getWorkspaceContext();
    const globalDataSource = await this.getGlobalWorkspaceDataSource();
    const queryRunner = globalDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await work({
          getRepository: <Entity extends ObjectLiteral>(
            objectMetadataName: string,
            rolePermissionConfig?: RolePermissionConfig,
          ): WorkspaceRepository<Entity> =>
            queryRunner.manager.getRepository<Entity>(
              objectMetadataName,
              rolePermissionConfig,
              authContext,
            ),
          executeRawQuery: (sql, parameters = []) =>
            queryRunner.query(sql, parameters) as Promise<
              Record<string, unknown>[]
            >,
        });

        await queryRunner.commitTransaction();

        return result;
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }

        throw error;
      }
    } finally {
      await queryRunner.release();
    }
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

    const entityMetadatas = featureFlagsMap[
      FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
    ]
      ? []
      : (
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'ORMEntityMetadatas',
          ])
        ).ORMEntityMetadatas;

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
      entityMetadatas,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
    };
  }

  private async loadLiteWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ]);

    const entityMetadatas = featureFlagsMap[
      FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
    ]
      ? []
      : (
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'ORMEntityMetadatas',
          ])
        ).ORMEntityMetadatas;

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
      entityMetadatas,
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    };
  }
}
