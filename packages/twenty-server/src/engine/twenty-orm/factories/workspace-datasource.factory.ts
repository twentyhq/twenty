import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { workspaceDataSourceCacheInstance } from 'src/engine/twenty-orm/twenty-orm-core.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceDatasourceFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  public async create(
    workspaceId: string,
    workspaceSchemaVersion: string | null,
  ): Promise<WorkspaceDataSource> {
    const desiredWorkspaceSchemaVersion =
      workspaceSchemaVersion ??
      (await this.workspaceCacheVersionService.getVersion(workspaceId));

    if (!desiredWorkspaceSchemaVersion) {
      throw new Error('Cache version not found');
    }

    const latestWorkspaceSchemaVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    if (latestWorkspaceSchemaVersion !== desiredWorkspaceSchemaVersion) {
      throw new Error('Cache version mismatch');
    }

    let cachedObjectMetadataCollection =
      await this.workspaceCacheStorageService.getObjectMetadataCollection(
        workspaceId,
      );

    if (!cachedObjectMetadataCollection) {
      const freshObjectMetadataCollection =
        await this.objectMetadataRepository.find({
          where: { workspaceId },
          relations: [
            'fields.object',
            'fields',
            'fields.fromRelationMetadata',
            'fields.toRelationMetadata',
            'fields.fromRelationMetadata.toObjectMetadata',
          ],
        });

      await this.workspaceCacheStorageService.setObjectMetadataCollection(
        workspaceId,
        freshObjectMetadataCollection,
      );

      cachedObjectMetadataCollection = freshObjectMetadataCollection;
    }

    const workspaceDataSource = await workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${latestWorkspaceSchemaVersion}`,
      async () => {
        const dataSourceMetadata =
          await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
            workspaceId,
          );

        if (!dataSourceMetadata) {
          throw new Error('Data source metadata not found');
        }

        if (!cachedObjectMetadataCollection) {
          throw new Error('Object metadata collection not found');
        }

        const entities = await Promise.all(
          cachedObjectMetadataCollection.map((objectMetadata) =>
            this.entitySchemaFactory.create(workspaceId, objectMetadata),
          ),
        );
        const workspaceDataSource = new WorkspaceDataSource(
          {
            workspaceId,
            workspaceCacheStorage: this.workspaceCacheStorageService,
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
            entities,
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
