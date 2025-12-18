import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import type { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    return this.getRepositoryOrReadOnlyRepository(
      workspaceId,
      workspaceEntityOrObjectMetadataName,
      permissionOptions,
      false,
    );
  }

  async getReadOnlyRepository<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntity: Type<T>,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>>;

  async getReadOnlyRepository<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>>;

  async getReadOnlyRepository<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
  ): Promise<WorkspaceRepository<T>> {
    return this.getRepositoryOrReadOnlyRepository(
      workspaceId,
      workspaceEntityOrObjectMetadataName,
      permissionOptions,
      true,
    );
  }

  private async getRepositoryOrReadOnlyRepository<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    permissionOptions?: RolePermissionConfig,
    isReadOnly: boolean = false,
  ): Promise<WorkspaceRepository<T>> {
    let objectMetadataName: string;

    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      objectMetadataName = workspaceEntityOrObjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        workspaceEntityOrObjectMetadataName.name,
      );
    }

    const isReadOnReplicaEnabledForWorkspace =
      await this.isReadOnReplicaEnabled(workspaceId);

    const globalDataSource =
      isReadOnly && isReadOnReplicaEnabledForWorkspace
        ? await this.getGlobalWorkspaceDataSourceReplica()
        : await this.getGlobalWorkspaceDataSource();

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

  async executeInWorkspaceContext<T>(
    authContext: WorkspaceAuthContext,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const context = await this.loadWorkspaceContext(authContext);

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
      ORMEntityMetadatas: entityMetadatas,
      userWorkspaceRoleMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'featureFlagsMap',
      'rolesPermissions',
      'ORMEntityMetadatas',
      'userWorkspaceRoleMap',
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
      userWorkspaceRoleMap,
    };
  }

  private async isReadOnReplicaEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return !!featureFlagsMap[FeatureFlagKey.IS_READ_ON_REPLICA_ENABLED];
  }
}
