import { Injectable, Optional, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectLiteral, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { workspaceDataSourceCacheInstance } from 'src/engine/twenty-orm/twenty-orm-core.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMManager {
  constructor(
    @Optional()
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource | null,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  async getRepository<T extends ObjectLiteral>(
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    entityClass: Type<T>,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    entityClassOrobjectMetadataName: Type<T> | string,
  ): Promise<WorkspaceRepository<T>> {
    let objectMetadataName: string;

    if (typeof entityClassOrobjectMetadataName === 'string') {
      objectMetadataName = entityClassOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        entityClassOrobjectMetadataName.name,
      );
    }

    if (!this.workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const workspaceId = this.workspaceDataSource.getWorkspaceId();

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

    const objectMetadata = objectMetadataCollection.find(
      (objectMetadata) => objectMetadata.nameSingular === objectMetadataName,
    );

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    const entitySchema = await this.entitySchemaFactory.create(
      workspaceId,
      objectMetadata,
    );

    if (!entitySchema) {
      throw new Error('Entity schema not found');
    }

    return this.workspaceDataSource.getRepository<T>(entitySchema);
  }

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
    const cacheVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    let objectMetadataName: string;

    if (typeof entityClassOrobjectMetadataName === 'string') {
      objectMetadataName = entityClassOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        entityClassOrobjectMetadataName.name,
      );
    }

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

    const workspaceDataSource = await workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${cacheVersion}`,
      async () => {
        const workspaceDataSource =
          await this.workspaceDataSourceFactory.create(entities, workspaceId);

        return workspaceDataSource;
      },
      (dataSource) => dataSource.destroy(),
    );

    const objectMetadata = objectMetadataCollection.find(
      (objectMetadata) => objectMetadata.nameSingular === objectMetadataName,
    );

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    const entitySchema = await this.entitySchemaFactory.create(
      workspaceId,
      objectMetadata,
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    if (!entitySchema) {
      throw new Error('Entity schema not found');
    }

    return workspaceDataSource.getRepository<T>(entitySchema);
  }
}
