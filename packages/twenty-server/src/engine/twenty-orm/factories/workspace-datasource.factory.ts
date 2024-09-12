import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { CacheManager } from 'src/engine/twenty-orm/storage/cache-manager.storage';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceDatasourceFactory {
  private cacheManager = new CacheManager<WorkspaceDataSource>();

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: number | null,
  ): Promise<WorkspaceDataSource> {
    const latestWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (latestWorkspaceMetadataVersion === undefined) {
      await this.workspaceMetadataCacheService.recomputeMetadataCache(
        workspaceId,
      );
      throw new TwentyORMException(
        `Metadata version not found for workspace ${workspaceId}`,
        TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const desiredWorkspaceMetadataVersion =
      workspaceMetadataVersion ?? latestWorkspaceMetadataVersion;

    if (latestWorkspaceMetadataVersion !== desiredWorkspaceMetadataVersion) {
      throw new TwentyORMException(
        `Workspace metadata version mismatch detected for workspace ${workspaceId}. Current version: ${latestWorkspaceMetadataVersion}. Desired version: ${desiredWorkspaceMetadataVersion}`,
        TwentyORMExceptionCode.METADATA_VERSION_MISMATCH,
      );
    }

    const workspaceDataSource = await this.cacheManager.execute(
      `${workspaceId}-${desiredWorkspaceMetadataVersion}`,
      async () => {
        const cachedObjectMetadataCollection =
          await this.workspaceCacheStorageService.getObjectMetadataCollection(
            workspaceId,
            desiredWorkspaceMetadataVersion,
          );

        if (!cachedObjectMetadataCollection) {
          await this.workspaceMetadataCacheService.recomputeMetadataCache(
            workspaceId,
            true,
          );

          throw new TwentyORMException(
            `Object metadata collection not found for workspace ${workspaceId}`,
            TwentyORMExceptionCode.METADATA_COLLECTION_NOT_FOUND,
          );
        }

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
            desiredWorkspaceMetadataVersion,
          );

        let cachedEntitySchemas: EntitySchema[];

        if (cachedEntitySchemaOptions) {
          cachedEntitySchemas = cachedEntitySchemaOptions.map(
            (option) => new EntitySchema(option),
          );
        } else {
          const entitySchemas = await Promise.all(
            cachedObjectMetadataCollection.map((objectMetadata) =>
              this.entitySchemaFactory.create(
                workspaceId,
                desiredWorkspaceMetadataVersion,
                objectMetadata,
              ),
            ),
          );

          await this.workspaceCacheStorageService.setORMEntitySchema(
            workspaceId,
            desiredWorkspaceMetadataVersion,
            entitySchemas.map((entitySchema) => entitySchema.options),
          );

          cachedEntitySchemas = entitySchemas;
        }

        const workspaceDataSource = new WorkspaceDataSource(
          {
            workspaceId,
            objectMetadataCollection: cachedObjectMetadataCollection,
          },
          {
            url:
              dataSourceMetadata.url ??
              this.environmentService.get('PG_DATABASE_URL'),
            type: 'postgres',
            logging: this.environmentService.get('DEBUG_MODE')
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
        );

        await workspaceDataSource.initialize();

        return workspaceDataSource;
      },
      (dataSource) => dataSource.destroy(),
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    return workspaceDataSource;
  }
}
