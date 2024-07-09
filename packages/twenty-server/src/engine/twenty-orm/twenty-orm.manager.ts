import { Injectable, Optional, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { ObjectEntitiesStorage } from 'src/engine/twenty-orm/storage/object-entities.storage';

@Injectable()
export class TwentyORMManager {
  constructor(
    @Optional()
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource | null,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepository(
    objectMetadataName: string,
  ): Promise<
    WorkspaceRepository<CustomWorkspaceEntity & { [key: string]: any }>
  >;

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

    const entitySchema =
      ObjectEntitiesStorage.getEntityByObjectMetadataName(objectMetadataName);

    if (!this.workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

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
    let objectMetadataName: string;

    if (typeof entityClassOrobjectMetadataName === 'string') {
      objectMetadataName = entityClassOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        entityClassOrobjectMetadataName.name,
      );
    }

    const entities = ObjectEntitiesStorage.getAllEntitySchemas();
    const entitySchema =
      ObjectEntitiesStorage.getEntityByObjectMetadataName(objectMetadataName);
    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      entities,
      workspaceId,
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
