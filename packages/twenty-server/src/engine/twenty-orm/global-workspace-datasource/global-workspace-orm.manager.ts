import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  type WorkspaceContextForStorage,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
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
    workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>> {
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

  async getGlobalWorkspaceDataSource() {
    return this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();
  }

  async executeInWorkspaceContext<T>(
    workspaceId: string,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const context = await this.loadWorkspaceContext(workspaceId);
    const globalDataSource =
      this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();

    if (
      !globalDataSource.hasWorkspaceEntityMetadataCacheForVersion(
        workspaceId,
        context.metadataVersion,
      )
    ) {
      await globalDataSource.buildWorkspaceMetadata(
        workspaceId,
        context.metadataVersion,
        context.objectMetadataMaps,
      );
    }

    return withWorkspaceContext(context, fn);
  }

  private async loadWorkspaceContext(
    workspaceId: string,
  ): Promise<WorkspaceContextForStorage> {
    const { objectMetadataMaps, metadataVersion } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        {
          workspaceId,
        },
      );

    const { data: featureFlagsMap } =
      await this.workspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMapAndVersion(
        { workspaceId },
      );

    const { data: permissionsPerRoleId } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    return {
      workspaceId,
      objectMetadataMaps,
      metadataVersion,
      featureFlagsMap,
      permissionsPerRoleId,
    };
  }
}
