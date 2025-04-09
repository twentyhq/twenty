import { Injectable, Logger } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: number | null,
    failOnMetadataCacheMiss = true,
  ): Promise<WorkspaceDataSource> {
    const cachedWorkspaceMetadataVersion =
      await this.getWorkspaceMetadataVersionFromCache(
        workspaceId,
        failOnMetadataCacheMiss,
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

    return workspaceDataSource;
  }

  private async getWorkspaceMetadataVersionFromCache(
    workspaceId: string,
    failOnMetadataCacheMiss = true,
  ): Promise<number> {
    let latestWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (latestWorkspaceMetadataVersion === undefined) {
      await this.workspaceMetadataCacheService.recomputeMetadataCache({
        workspaceId,
        ignoreLock: !failOnMetadataCacheMiss,
      });

      if (failOnMetadataCacheMiss) {
        throw new TwentyORMException(
          `Metadata version not found for workspace ${workspaceId}`,
          TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
        );
      } else {
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
