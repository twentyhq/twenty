import { Injectable, Logger } from '@nestjs/common';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntitySchema } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceFeatureFlagMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flag-map-cache.service.ts/workspace-feature-flag-map-cache.service';
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

type CacheResult<T, U> = {
  version: T;
  data: U;
};

@Injectable()
export class WorkspaceDatasourceFactory {
  private readonly logger = new Logger(WorkspaceDatasourceFactory.name);
  private promiseMemoizer = new PromiseMemoizer<WorkspaceDataSource>();

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceRolesPermissionsCacheService: WorkspaceRolesPermissionsCacheService,
    private readonly workspaceFeatureFlagMapCacheService: WorkspaceFeatureFlagMapCacheService,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: number | null,
    shouldFailIfMetadataNotFound = true,
  ): Promise<WorkspaceDataSource> {
    const cachedWorkspaceMetadataVersion =
      await this.getWorkspaceMetadataVersionFromCache(
        workspaceId,
        shouldFailIfMetadataNotFound,
      );

    const { data: cachedFeatureFlagMap, version: cachedFeatureFlagMapVersion } =
      await this.getFeatureFlagMapFromCache({ workspaceId });

    const isPermissionsV2Enabled =
      cachedFeatureFlagMap[FeatureFlagKey.IsPermissionsV2Enabled];

    const {
      data: cachedRolesPermissions,
      version: cachedRolesPermissionsVersion,
    } = await this.getRolesPermissionsFromCache({
      workspaceId,
      isPermissionsV2Enabled,
    });

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
                this.twentyConfigService.get('PG_DATABASE_URL'),
              type: 'postgres',
              logging:
                this.twentyConfigService.get('NODE_ENV') ===
                NodeEnvironment.development
                  ? ['query', 'error']
                  : ['error'],
              schema: dataSourceMetadata.schema,
              entities: cachedEntitySchemas,
              ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
                ? {
                    rejectUnauthorized: false,
                  }
                : undefined,
            },
            cachedFeatureFlagMapVersion,
            cachedFeatureFlagMap,
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
      await this.updateWorkspaceDataSourceRolesPermissionsIfNeeded({
        workspaceDataSource,
        cachedRolesPermissionsVersion,
        cachedRolesPermissions,
      });
    }

    await this.updateWorkspaceDataSourceFeatureFlagMapIfNeeded({
      workspaceDataSource,
      cachedFeatureFlagMapVersion,
      cachedFeatureFlagMap,
    });

    return workspaceDataSource;
  }

  private async getFromCacheWithRecompute<T, U>({
    workspaceId,
    getCacheData,
    getCacheVersion,
    recomputeCache,
    cachedEntityName,
    exceptionCode,
  }: {
    workspaceId: string;
    getCacheData: (workspaceId: string) => Promise<U | undefined>;
    getCacheVersion: (workspaceId: string) => Promise<T | undefined>;
    recomputeCache: (params: { workspaceId: string }) => Promise<void>;
    cachedEntityName: string;
    exceptionCode: TwentyORMExceptionCode;
  }): Promise<CacheResult<T, U>> {
    let cachedVersion: T | undefined;
    let cachedData: U | undefined;

    cachedVersion = await getCacheVersion(workspaceId);
    cachedData = await getCacheData(workspaceId);

    if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
      await recomputeCache({ workspaceId });

      cachedData = await getCacheData(workspaceId);
      cachedVersion = await getCacheVersion(workspaceId);

      if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
        throw new TwentyORMException(
          `${cachedEntityName} not found after recompute for workspace ${workspaceId}`,
          exceptionCode,
        );
      }
    }

    return {
      version: cachedVersion,
      data: cachedData,
    };
  }

  private async getRolesPermissionsFromCache({
    workspaceId,
    isPermissionsV2Enabled,
  }: {
    workspaceId: string;
    isPermissionsV2Enabled?: boolean;
  }): Promise<
    CacheResult<
      string | undefined,
      ObjectRecordsPermissionsByRoleId | undefined
    >
  > {
    if (!isPermissionsV2Enabled) {
      return { version: undefined, data: undefined };
    }

    return this.getFromCacheWithRecompute<
      string | undefined,
      ObjectRecordsPermissionsByRoleId | undefined
    >({
      workspaceId,
      getCacheData: () =>
        this.workspaceCacheStorageService.getRolesPermissions(workspaceId),
      getCacheVersion: () =>
        this.workspaceCacheStorageService.getRolesPermissionsVersionFromCache(
          workspaceId,
        ),
      recomputeCache: (params) =>
        this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
          params,
        ),
      cachedEntityName: 'Roles permissions',
      exceptionCode: TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND,
    });
  }

  private async getFeatureFlagMapFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, FeatureFlagMap>> {
    return this.getFromCacheWithRecompute<string, FeatureFlagMap>({
      workspaceId,
      getCacheData: () =>
        this.workspaceCacheStorageService.getFeatureFlagMap(workspaceId),
      getCacheVersion: () =>
        this.workspaceCacheStorageService.getFeatureFlagMapVersionFromCache(
          workspaceId,
        ),
      recomputeCache: (params) =>
        this.workspaceFeatureFlagMapCacheService.recomputeFeatureFlagMapCache(
          params,
        ),
      cachedEntityName: 'Feature flag map',
      exceptionCode: TwentyORMExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND,
    });
  }

  private updateWorkspaceDataSourceIfNeeded<T>({
    workspaceDataSource,
    currentVersion,
    newVersion,
    newData,
    setData,
    setVersion,
  }: {
    workspaceDataSource: WorkspaceDataSource;
    currentVersion: string | undefined;
    newVersion: string | undefined;
    newData: T | undefined;
    setData: (data: T) => void;
    setVersion: (version: string) => void;
  }): void {
    if (
      isDefined(newVersion) &&
      isDefined(newData) &&
      currentVersion !== newVersion
    ) {
      workspaceDataSource.manager.repositories.clear();
      setData(newData);
      setVersion(newVersion);
    }
  }

  private async updateWorkspaceDataSourceRolesPermissionsIfNeeded({
    workspaceDataSource,
    cachedRolesPermissionsVersion,
    cachedRolesPermissions,
  }: {
    workspaceDataSource: WorkspaceDataSource;
    cachedRolesPermissionsVersion: string | undefined;
    cachedRolesPermissions: ObjectRecordsPermissionsByRoleId | undefined;
  }): Promise<void> {
    this.updateWorkspaceDataSourceIfNeeded({
      workspaceDataSource,
      currentVersion: workspaceDataSource.rolesPermissionsVersion,
      newVersion: cachedRolesPermissionsVersion,
      newData: cachedRolesPermissions,
      setData: (data) => workspaceDataSource.setRolesPermissions(data),
      setVersion: (version) =>
        workspaceDataSource.setRolesPermissionsVersion(version),
    });
  }

  private async updateWorkspaceDataSourceFeatureFlagMapIfNeeded({
    workspaceDataSource,
    cachedFeatureFlagMapVersion,
    cachedFeatureFlagMap,
  }: {
    workspaceDataSource: WorkspaceDataSource;
    cachedFeatureFlagMapVersion: string | undefined;
    cachedFeatureFlagMap: FeatureFlagMap | undefined;
  }): Promise<void> {
    this.updateWorkspaceDataSourceIfNeeded({
      workspaceDataSource,
      currentVersion: workspaceDataSource.featureFlagMapVersion,
      newVersion: cachedFeatureFlagMapVersion,
      newData: cachedFeatureFlagMap,
      setData: (data) => workspaceDataSource.setFeatureFlagMap(data),
      setVersion: (version) =>
        workspaceDataSource.setFeatureFlagMapVersion(version),
    });
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

  public async destroy(workspaceId: string) {
    await this.promiseMemoizer.clearKeys(`${workspaceId}-`, (dataSource) => {
      dataSource.destroy();
    });
  }
}
