import { Injectable, Optional, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { workspaceDataSourceCacheInstance } from 'src/engine/twenty-orm/twenty-orm-core.module';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';

@Injectable()
export class TwentyORMManager {
  constructor(
    @Optional()
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource | null,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
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

    const entitySchema = await this.entitySchemaFactory.create(
      this.workspaceDataSource.internalContext.workspaceId,
      objectMetadataName,
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

    const workspaceDataSource = await workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${cacheVersion}`,
      async () => {
        const entities = WorkspaceEntitiesStorage.getEntities(workspaceId);

        return this.workspaceDataSourceFactory.create(entities, workspaceId);
      },
      (dataSource) => dataSource.destroy(),
    );

    const entitySchema = await this.entitySchemaFactory.create(
      workspaceId,
      objectMetadataName,
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
