import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import type { WorkspaceDataSourceInterface } from 'src/engine/twenty-orm/interfaces/workspace-datasource.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import type { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async isGlobalDataSourceFlow(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return (
      featureFlagsMap[FeatureFlagKey.IS_GLOBAL_WORKSPACE_DATASOURCE_ENABLED] ===
      true
    );
  }

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
    workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>> {
    const isGlobalFlow = await this.isGlobalDataSourceFlow(workspaceId);

    if (isGlobalFlow) {
      let objectMetadataName: string;

      if (typeof workspaceEntityOrObjectMetadataName === 'string') {
        objectMetadataName = workspaceEntityOrObjectMetadataName;
      } else {
        objectMetadataName = convertClassNameToObjectMetadataName(
          workspaceEntityOrObjectMetadataName.name,
        );
      }

      const globalDataSource =
        this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();

      return globalDataSource.getRepository<T>(
        objectMetadataName,
        permissionOptions,
      );
    }

    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      return this.twentyORMGlobalManager.getRepositoryForWorkspace<T>(
        workspaceId,
        workspaceEntityOrObjectMetadataName,
        permissionOptions,
      );
    }

    return this.twentyORMGlobalManager.getRepositoryForWorkspace<T>(
      workspaceId,
      workspaceEntityOrObjectMetadataName,
      permissionOptions,
    );
  }

  async getDataSourceForWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceDataSourceInterface> {
    const isGlobalFlow = await this.isGlobalDataSourceFlow(workspaceId);

    if (isGlobalFlow) {
      return this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();
    }

    return this.twentyORMGlobalManager.getDataSourceForWorkspace({
      workspaceId,
    });
  }

  async getGlobalWorkspaceDataSource() {
    return this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();
  }

  async executeInWorkspaceContext<T>(
    authContext: WorkspaceAuthContext,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const context = await this.loadWorkspaceContext(authContext);

    return withWorkspaceContext(context, fn);
  }

  async destroyDataSourceForWorkspace(workspaceId: string): Promise<void> {
    await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
      workspaceId,
    );
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
      ORMEntityMetadatas: entityMetadatas,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'featureFlagsMap',
      'rolesPermissions',
      'ORMEntityMetadatas',
    ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      objectIdByNameSingular,
      featureFlagsMap,
      permissionsPerRoleId,
      entityMetadatas,
    };
  }
}
