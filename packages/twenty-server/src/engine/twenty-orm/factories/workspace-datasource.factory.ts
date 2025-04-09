import { Injectable, Logger } from '@nestjs/common';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntitySchema } from 'typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/workspace-roles-permissions-cache/workspace-roles-permissions-cache.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceDatasourceFactory {
  private readonly logger = new Logger(WorkspaceDatasourceFactory.name);
  private promiseMemoizer = new PromiseMemoizer<WorkspaceDataSource>();

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceRolesPermissionsCacheService: WorkspaceRolesPermissionsCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: number | null,
    shouldFailIfMetadataNotFound = true,
  ): Promise<WorkspaceDataSource> {
    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const cachedWorkspaceMetadataVersion =
      await this.getWorkspaceMetadataVersionFromCache(
        workspaceId,
        shouldFailIfMetadataNotFound,
      );

    const isPermissionsV2Enabled =
      featureFlagsMap[FeatureFlagKey.IsPermissionsV2Enabled];

    const { cachedRolesPermissionsVersion, cachedRolesPermissions } =
      await this.getRolesPermissionsFromCache(
        workspaceId,
        isPermissionsV2Enabled,
      );

    if (
      workspaceMetadataVersion !== null &&
      cachedWorkspaceMetadataVersion !== workspaceMetadataVersion
    ) {
      throw new TwentyORMException(
        `Workspace metadata version mismatch detected for workspace ${workspaceId}. Current version: ${cachedWorkspaceMetadataVersion}. Desired version: ${workspaceMetadataVersion}`,
        TwentyORMExceptionCode.METADATA_VERSION_MISMATCH,
      );
    }

    const cacheKey: CacheKey = `${workspaceId}-${cachedWorkspaceMetadataVersion}`;

    const workspaceDataSource =
      await this.promiseMemoizer.memoizePromiseAndExecute(
        cacheKey,
        async () => {
          const dataSourceMetadata =
            await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
              workspaceId,
            );

          if (!dataSourceMetadata) {
            throw new TwentyORMException(
              `Workspace Schema not found for workspace ${workspaceId}`,
              TwentyORMExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND,
            );
          }

          const cachedEntitySchemaOptions =
            await this.workspaceCacheStorageService.getORMEntitySchema(
              workspaceId,
              cachedWorkspaceMetadataVersion,
            );

          let cachedEntitySchemas: EntitySchema[];

          const cachedObjectMetadataMaps =
            await this.workspaceCacheStorageService.getObjectMetadataMaps(
              workspaceId,
              cachedWorkspaceMetadataVersion,
            );

          if (!cachedObjectMetadataMaps) {
            throw new TwentyORMException(
              `Object metadata collection not found for workspace ${workspaceId}`,
              TwentyORMExceptionCode.METADATA_COLLECTION_NOT_FOUND,
            );
          }

          if (cachedEntitySchemaOptions) {
            cachedEntitySchemas = cachedEntitySchemaOptions.map(
              (option) => new EntitySchema(option),
            );
          } else {
            const entitySchemas = await Promise.all(
              Object.values(cachedObjectMetadataMaps.byId).map(
                (objectMetadata) =>
                  this.entitySchemaFactory.create(
                    workspaceId,
                    cachedWorkspaceMetadataVersion,
                    objectMetadata,
                    cachedObjectMetadataMaps,
                  ),
              ),
            );

            await this.workspaceCacheStorageService.setORMEntitySchema(
              workspaceId,
              cachedWorkspaceMetadataVersion,
              entitySchemas.map((entitySchema) => entitySchema.options),
            );

            cachedEntitySchemas = entitySchemas;
          }

          const workspaceDataSource = new WorkspaceDataSource(
            {
              workspaceId,
              objectMetadataMaps: cachedObjectMetadataMaps,
            },
            {
              url:
                dataSourceMetadata.url ??
                this.environmentService.get('PG_DATABASE_URL'),
              type: 'postgres',
              logging:
                this.environmentService.get('NODE_ENV') ===
                NodeEnvironment.development
                  ? ['query', 'error']
                  : ['error'],
              schema: dataSourceMetadata.schema,
              entities: cachedEntitySchemas,
              ssl: this.environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
                ? {
                    rejectUnauthorized: false,
                  }
                : undefined,
            },
            cachedRolesPermissionsVersion,
            cachedRolesPermissions,
          );

          await workspaceDataSource.initialize();

          return workspaceDataSource;
        },
        async (dataSource) => {
          try {
            await dataSource.destroy();
          } catch (error) {
            // Ignore error if pool has already been destroyed which is a common race condition case
            if (error.message === 'Called end on pool more than once') {
              return;
            }
            throw error;
          }
        },
      );

    if (!workspaceDataSource) {
      throw new Error(`Failed to create WorkspaceDataSource for ${cacheKey}`);
    }

    if (isPermissionsV2Enabled) {
      await this.updateWorkspaceDataSourceRolesPermissionsIfNeeded(
        workspaceDataSource,
        cachedRolesPermissionsVersion,
        cachedRolesPermissions,
      );
    }

    return workspaceDataSource;
  }

  private async getWorkspaceMetadataVersionFromCache(
    workspaceId: string,
    shouldFailIfMetadataNotFound = true,
  ): Promise<number> {
    let latestWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (latestWorkspaceMetadataVersion === undefined) {
      if (shouldFailIfMetadataNotFound) {
        throw new TwentyORMException(
          `Metadata version not found for workspace ${workspaceId}`,
          TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
        );
      } else {
        await this.workspaceMetadataCacheService.recomputeMetadataCache({
          workspaceId,
          ignoreLock: !shouldFailIfMetadataNotFound,
        });
        latestWorkspaceMetadataVersion =
          await this.workspaceCacheStorageService.getMetadataVersion(
            workspaceId,
          );
      }
    }

    if (!latestWorkspaceMetadataVersion) {
      throw new TwentyORMException(
        `Metadata version not found after recompute for workspace ${workspaceId}`,
        TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    return latestWorkspaceMetadataVersion;
  }

  private async updateWorkspaceDataSourceRolesPermissionsIfNeeded(
    workspaceDataSource: WorkspaceDataSource,
    cachedRolesPermissionsVersion: string | undefined,
    cachedRolesPermissions: ObjectRecordsPermissionsByRoleId | undefined,
  ) {
    if (
      isDefined(cachedRolesPermissionsVersion) &&
      isDefined(cachedRolesPermissions)
    ) {
      if (
        workspaceDataSource.rolesPermissionsVersion !==
        cachedRolesPermissionsVersion
      ) {
        workspaceDataSource.manager.repositories.clear();
        workspaceDataSource.setRolesPermissionsVersion(
          cachedRolesPermissionsVersion,
        );
        workspaceDataSource.setRolesPermissions(cachedRolesPermissions);
      }
    }
  }

  private async getRolesPermissionsFromCache(
    workspaceId: string,
    isPermissionsV2Enabled: boolean,
  ): Promise<{
    cachedRolesPermissionsVersion: string | undefined;
    cachedRolesPermissions: ObjectRecordsPermissionsByRoleId | undefined;
  }> {
    let cachedRolesPermissionsVersion: string | undefined;
    let cachedRolesPermissions: ObjectRecordsPermissionsByRoleId | undefined;

    if (isPermissionsV2Enabled) {
      cachedRolesPermissions =
        await this.workspaceCacheStorageService.getRolesPermissions(
          workspaceId,
        );

      cachedRolesPermissionsVersion =
        await this.getRolesVersionFromCache(workspaceId);

      if (!cachedRolesPermissions || !cachedRolesPermissionsVersion) {
        await this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
          {
            workspaceId,
          },
        );

        cachedRolesPermissions =
          await this.workspaceCacheStorageService.getRolesPermissions(
            workspaceId,
          );

        cachedRolesPermissionsVersion =
          await this.getRolesVersionFromCache(workspaceId);
      }
    }

    return { cachedRolesPermissionsVersion, cachedRolesPermissions };
  }

  private async getRolesVersionFromCache(workspaceId: string): Promise<string> {
    let latestRolesVersion =
      await this.workspaceCacheStorageService.getRolesPermissionsVersionFromCache(
        workspaceId,
      );

    if (latestRolesVersion === undefined) {
      await this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
        },
      );
      latestRolesVersion =
        await this.workspaceCacheStorageService.getRolesPermissionsVersionFromCache(
          workspaceId,
        );
    }

    if (!latestRolesVersion) {
      throw new TwentyORMException(
        `Roles permissions version not found after recompute for workspace ${workspaceId}`,
        TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND,
      );
    }

    return latestRolesVersion;
  }

  public async destroy(workspaceId: string) {
    await this.promiseMemoizer.clearKeys(`${workspaceId}-`, (dataSource) => {
      dataSource.destroy();
    });
  }
}
