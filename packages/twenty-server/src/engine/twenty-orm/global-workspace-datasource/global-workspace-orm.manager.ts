import { Injectable, type Type } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { EntitySchema, type ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  type WorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class GlobalWorkspaceOrmManager {
  constructor(
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
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
    authContext: WorkspaceAuthContext,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const context = await this.loadWorkspaceContext(authContext);

    return withWorkspaceContext(context, fn);
  }

  private async loadWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<WorkspaceContext> {
    const workspaceId = authContext.workspace.id;
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

    const entitySchemas = await this.buildEntitySchemas(
      workspaceId,
      metadataVersion,
      objectMetadataMaps,
    );

    return {
      authContext,
      objectMetadataMaps,
      metadataVersion,
      featureFlagsMap,
      permissionsPerRoleId,
      entitySchemas,
    };
  }

  private async buildEntitySchemas(
    workspaceId: string,
    dataSourceMetadataVersion: number,
    objectMetadataMaps: ObjectMetadataMaps,
  ) {
    const cachedEntitySchemaOptions =
      await this.workspaceCacheStorageService.getORMEntitySchema(
        workspaceId,
        dataSourceMetadataVersion,
      );

    let cachedEntitySchemas: EntitySchema[];

    if (cachedEntitySchemaOptions) {
      cachedEntitySchemas = cachedEntitySchemaOptions.map(
        (option) => new EntitySchema(option),
      );
    } else {
      const entitySchemas = await Promise.all(
        Object.values(objectMetadataMaps.byId)
          .filter(isDefined)
          .map((objectMetadata) =>
            this.entitySchemaFactory.create(
              workspaceId,
              objectMetadata,
              objectMetadataMaps,
            ),
          ),
      );

      await this.workspaceCacheStorageService.setORMEntitySchema(
        workspaceId,
        dataSourceMetadataVersion,
        entitySchemas.map((entitySchema) => entitySchema.options),
      );

      cachedEntitySchemas = entitySchemas;
    }

    return cachedEntitySchemas;
  }
}
