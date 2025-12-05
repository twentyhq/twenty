import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntitySchema, Repository } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const TWENTY_MINUTES_IN_MS = 120_000;

@Injectable()
export class WorkspaceDatasourceFactory {
  private readonly logger = new Logger(WorkspaceDatasourceFactory.name);
  private promiseMemoizer = new PromiseMemoizer<WorkspaceDataSource>();

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

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

    const {
      featureFlagsMap: cachedFeatureFlagMap,
      rolesPermissions: cachedRolesPermissions,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'rolesPermissions',
    ]);

    const cachedFeatureFlagMapVersion = crypto
      .createHash('sha256')
      .update(JSON.stringify(cachedFeatureFlagMap))
      .digest('hex');

    const cachedRolesPermissionsVersion = crypto
      .createHash('sha256')
      .update(JSON.stringify(cachedRolesPermissions))
      .digest('hex');

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
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            flatIndexMaps,
          } =
            await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
              {
                workspaceId,
                flatMapsKeys: [
                  'flatObjectMetadataMaps',
                  'flatFieldMetadataMaps',
                  'flatIndexMaps',
                ],
              },
            );

          const { idByNameSingular: objectIdByNameSingular } =
            buildObjectIdByNameMaps(flatObjectMetadataMaps);

          const metadataVersionForFinalUpToDateCheck =
            await this.workspaceCacheStorageService.getMetadataVersion(
              workspaceId,
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
            const entitySchemas = Object.values(flatObjectMetadataMaps.byId)
              .filter(isDefined)
              .map((flatObjectMetadata) =>
                this.entitySchemaFactory.create(
                  workspaceId,
                  flatObjectMetadata,
                  flatObjectMetadataMaps,
                  flatFieldMetadataMaps,
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
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              flatIndexMaps,
              objectIdByNameSingular,
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
            this.twentyConfigService.get('PG_ENABLE_POOL_SHARING'),
          );

          await workspaceDataSource.initialize();

          return workspaceDataSource;
        },
        this.safelyDestroyDataSource.bind(this),
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
    cachedRolesPermissions: ObjectsPermissionsByRoleId;
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

    await this.workspaceCacheStorageService.setMetadataVersion(
      workspaceId,
      workspace.metadataVersion,
    );

    return workspace.metadataVersion;
  }

  public async destroy(workspaceId: string) {
    try {
      await this.promiseMemoizer.clearKeys(
        `${workspaceId}-`,
        this.safelyDestroyDataSource.bind(this),
      );
    } catch (error) {
      // Log and swallow any errors during cleanup to prevent crashes
      this.logger.warn(
        `Error cleaning up datasources for workspace ${workspaceId}: ${error.message}`,
      );
    }
  }
}
