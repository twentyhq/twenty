import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntitySchema, Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import {
  ROLES_PERMISSIONS,
  WorkspacePermissionsCacheService,
} from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';
import { getFromCacheWithRecompute } from 'src/engine/utils/get-data-from-cache-with-recompute.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

const TWENTY_MINUTES_IN_MS = 120_000;

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
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspacePermissionsCacheStorageService: WorkspacePermissionsCacheStorageService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  private async conditionalDestroyDataSource(
    dataSource: WorkspaceDataSource,
  ): Promise<void> {
    const isPoolSharingEnabled = this.twentyConfigService.get(
      'PG_ENABLE_POOL_SHARING',
    );

    if (isPoolSharingEnabled) {
      this.logger.log(
        `PromiseMemoizer Event: A WorkspaceDataSource for workspace ${dataSource.internalContext.workspaceId} is being cleared. Actual pool closure managed by PgPoolSharedService. Not calling dataSource.destroy().`,
      );
      // We should NOT call dataSource.destroy() here, because that would end
      // the shared pool, potentially affecting other active users of that pool.
      // The PgPoolSharedService is responsible for the lifecycle of shared pools.
    } else {
      this.logger.log(
        `PromiseMemoizer Event: A WorkspaceDataSource for workspace ${dataSource.internalContext.workspaceId} is being cleared. Calling safelyDestroyDataSource.`,
      );
      await this.safelyDestroyDataSource(dataSource);
    }
  }

  private async safelyDestroyDataSource(
    dataSource: WorkspaceDataSource,
  ): Promise<void> {
    try {
      await dataSource.destroy();
    } catch (error) {
      // Ignore known race-condition errors to prevent noise during shutdown
      if (
        error.message === 'Called end on pool more than once' ||
        error.message?.includes(
          'pool is draining and cannot accommodate new clients',
        )
      ) {
        this.logger.debug(
          `Ignoring pool error during cleanup: ${error.message}`,
        );

        return;
      }

      throw error;
    }
  }

  public async create(workspaceId: string): Promise<WorkspaceDataSource> {
    const dataSourceMetadataVersion =
      await this.getWorkspaceMetadataVersionFromCacheOrFromDB(workspaceId);

    const { data: cachedFeatureFlagMap, version: cachedFeatureFlagMapVersion } =
      await this.workspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMapAndVersion(
        { workspaceId },
      );

    const {
      data: cachedRolesPermissions,
      version: cachedRolesPermissionsVersion,
    } = await this.getRolesPermissionsFromCache({
      workspaceId,
    });

    const cacheKey: CacheKey = `${workspaceId}-${dataSourceMetadataVersion}`;

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
              dataSourceMetadataVersion,
            );

          let cachedEntitySchemas: EntitySchema[];

          const {
            objectMetadataMaps: cachedObjectMetadataMaps,
            metadataVersion: metadataVersionForFinalUpToDateCheck,
          } =
            await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
              {
                workspaceId,
              },
            );

          if (
            metadataVersionForFinalUpToDateCheck !== dataSourceMetadataVersion
          ) {
            throw new TwentyORMException(
              `Workspace metadata version mismatch detected for workspace ${workspaceId}. Latest version: ${metadataVersionForFinalUpToDateCheck}. Built version: ${dataSourceMetadataVersion}`,
              TwentyORMExceptionCode.METADATA_VERSION_MISMATCH,
            );
          }

          if (cachedEntitySchemaOptions) {
            cachedEntitySchemas = cachedEntitySchemaOptions.map(
              (option) => new EntitySchema(option),
            );
          } else {
            const entitySchemas = await Promise.all(
              Object.values(cachedObjectMetadataMaps.byId)
                .filter(isDefined)
                .map((objectMetadata) =>
                  this.entitySchemaFactory.create(
                    workspaceId,
                    dataSourceMetadataVersion,
                    objectMetadata,
                    cachedObjectMetadataMaps,
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

          const workspaceDataSource = new WorkspaceDataSource(
            {
              workspaceId,
              objectMetadataMaps: cachedObjectMetadataMaps,
              featureFlagsMap: cachedFeatureFlagMap,
              eventEmitterService: this.workspaceEventEmitter,
            },
            {
              url:
                dataSourceMetadata.url ??
                this.twentyConfigService.get('PG_DATABASE_URL'),
              type: 'postgres',
              logging: this.twentyConfigService.getLoggingConfig(),
              schema: dataSourceMetadata.schema,
              entities: cachedEntitySchemas,
              ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
                ? {
                    rejectUnauthorized: false,
                  }
                : undefined,
              extra: {
                query_timeout: 10000,
                // https://node-postgres.com/apis/pool
                // TypeORM doesn't allow sharing connection pools between data sources
                // So we keep a small pool open for longer if connection pooling patch isn't enabled
                // TODO: Probably not needed anymore when connection pooling patch is enabled
                idleTimeoutMillis: TWENTY_MINUTES_IN_MS,
                max: 4,
                allowExitOnIdle: true,
              },
            },
            cachedFeatureFlagMapVersion,
            cachedFeatureFlagMap,
            cachedRolesPermissionsVersion,
            cachedRolesPermissions,
          );

          await workspaceDataSource.initialize();

          return workspaceDataSource;
        },
        this.conditionalDestroyDataSource.bind(this),
      );

    if (!workspaceDataSource) {
      throw new Error(`Failed to create WorkspaceDataSource for ${cacheKey}`);
    }

    await this.updateWorkspaceDataSourceRolesPermissionsIfNeeded({
      workspaceDataSource,
      cachedRolesPermissionsVersion,
      cachedRolesPermissions,
    });

    await this.updateWorkspaceDataSourceFeatureFlagsMapIfNeeded({
      workspaceDataSource,
      cachedFeatureFlagMapVersion,
      cachedFeatureFlagMap,
    });

    return workspaceDataSource;
  }

  private async getRolesPermissionsFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, ObjectRecordsPermissionsByRoleId>> {
    return getFromCacheWithRecompute<string, ObjectRecordsPermissionsByRoleId>({
      workspaceId,
      getCacheData: () =>
        this.workspacePermissionsCacheStorageService.getRolesPermissions(
          workspaceId,
        ),
      getCacheVersion: () =>
        this.workspacePermissionsCacheStorageService.getRolesPermissionsVersion(
          workspaceId,
        ),
      recomputeCache: () =>
        this.workspacePermissionsCacheService.recomputeRolesPermissionsCache({
          workspaceId,
        }),
      cachedEntityName: ROLES_PERMISSIONS,
      exceptionCode: TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND,
      logger: this.logger,
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
    cachedRolesPermissionsVersion: string;
    cachedRolesPermissions: ObjectRecordsPermissionsByRoleId;
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

  private async updateWorkspaceDataSourceFeatureFlagsMapIfNeeded({
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

  private async getWorkspaceMetadataVersionFromCacheOrFromDB(
    workspaceId: string,
  ): Promise<number> {
    const latestWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (isDefined(latestWorkspaceMetadataVersion)) {
      return latestWorkspaceMetadataVersion;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new TwentyORMException(
        `Workspace not found for workspace ${workspaceId}`,
        TwentyORMExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    return workspace.metadataVersion;
  }

  public async destroy(workspaceId: string) {
    try {
      await this.promiseMemoizer.clearKeys(
        `${workspaceId}-`,
        this.conditionalDestroyDataSource.bind(this),
      );
    } catch (error) {
      // Log and swallow any errors during cleanup to prevent crashes
      this.logger.warn(
        `Error cleaning up datasources for workspace ${workspaceId}: ${error.message}`,
      );
    }
  }
}
