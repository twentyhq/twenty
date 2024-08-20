import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntitySchema, Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.service';
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
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: string | null,
  ): Promise<WorkspaceDataSource> {
    const desiredWorkspaceMetadataVersion =
      workspaceMetadataVersion ??
      (await this.workspaceMetadataVersionService.getMetadataVersion(
        workspaceId,
      ));

    if (!desiredWorkspaceMetadataVersion) {
      throw new Error(
        `Desired workspace metadata version not found while creating workspace data source for workspace ${workspaceId}`,
      );
    }

    const latestWorkspaceMetadataVersion =
      await this.workspaceMetadataVersionService.getMetadataVersion(
        workspaceId,
      );

    if (latestWorkspaceMetadataVersion !== desiredWorkspaceMetadataVersion) {
      throw new Error(
        `Workspace metadata version mismatch detected for workspace ${workspaceId}. Current version: ${latestWorkspaceMetadataVersion}. Desired version: ${desiredWorkspaceMetadataVersion}`,
      );
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
      `${workspaceId}-${latestWorkspaceMetadataVersion}`,
      async () => {
        const dataSourceMetadata =
          await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
            workspaceId,
          );

        if (!dataSourceMetadata) {
          throw new Error(
            `Data source metadata not found for workspace ${workspaceId}`,
          );
        }

        if (!cachedObjectMetadataCollection) {
          throw new Error(
            `Object metadata collection not found for workspace ${workspaceId}`,
          );
        }

        const cachedEntitySchemaOptions =
          await this.workspaceCacheStorageService.getORMEntitySchema(
            workspaceId,
          );

        let cachedEntitySchemas: EntitySchema[];

        if (cachedEntitySchemaOptions) {
          cachedEntitySchemas = cachedEntitySchemaOptions.map(
            (option) => new EntitySchema(option),
          );
        } else {
          const entitySchemas = await Promise.all(
            cachedObjectMetadataCollection.map((objectMetadata) =>
              this.entitySchemaFactory.create(workspaceId, objectMetadata),
            ),
          );

          await this.workspaceCacheStorageService.setORMEntitySchema(
            workspaceId,
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
