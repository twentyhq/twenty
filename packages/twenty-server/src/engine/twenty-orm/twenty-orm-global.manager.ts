import { Injectable, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectLiteral, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { workspaceDataSourceCacheInstance } from 'src/engine/twenty-orm/twenty-orm-core.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMGlobalManager {
  constructor(
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClass: Type<T>,
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace(
    workspaceId: string,
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<CustomWorkspaceEntity>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClassOrobjectMetadataName: Type<T> | string,
  ): Promise<
    WorkspaceRepository<T> | WorkspaceRepository<CustomWorkspaceEntity>
  > {
    let objectMetadataName: string;

    if (typeof entityClassOrobjectMetadataName === 'string') {
      objectMetadataName = entityClassOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        entityClassOrobjectMetadataName.name,
      );
    }

    return this.buildRepositoryForWorkspace<T>(workspaceId, objectMetadataName);
  }

  async buildDatasourceForWorkspace(workspaceId: string) {
    const cacheVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    let objectMetadataCollection =
      await this.workspaceCacheStorageService.getObjectMetadataCollection(
        workspaceId,
      );

    if (!objectMetadataCollection) {
      objectMetadataCollection = await this.objectMetadataRepository.find({
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
        objectMetadataCollection,
      );
    }

    const entities = await Promise.all(
      objectMetadataCollection.map((objectMetadata) =>
        this.entitySchemaFactory.create(workspaceId, objectMetadata),
      ),
    );

    return await workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${cacheVersion}`,
      async () => {
        const workspaceDataSource =
          await this.workspaceDataSourceFactory.create(entities, workspaceId);

        return workspaceDataSource;
      },
      (dataSource) => dataSource.destroy(),
    );
  }

  async buildRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
  ) {
    const workspaceDataSource =
      await this.buildDatasourceForWorkspace(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    return workspaceDataSource.getRepository<T>(objectMetadataName);
  }
}
