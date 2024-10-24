import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMGlobalManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntity: Type<T>,
    failOnMetadataCacheMiss?: boolean,
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
    failOnMetadataCacheMiss?: boolean,
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntityOrobjectMetadataName: Type<T> | string,
    failOnMetadataCacheMiss = true,
  ): Promise<WorkspaceRepository<T>> {
    let objectMetadataName: string;

    if (typeof workspaceEntityOrobjectMetadataName === 'string') {
      objectMetadataName = workspaceEntityOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        workspaceEntityOrobjectMetadataName.name,
      );
    }

    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      workspaceId,
      null,
      failOnMetadataCacheMiss,
    );

    const repository = workspaceDataSource.getRepository<T>(objectMetadataName);

    return repository;
  }

  async getDataSourceForWorkspace(workspaceId: string) {
    return await this.workspaceDataSourceFactory.create(workspaceId, null);
  }

  async destroyDataSourceForWorkspace(workspaceId: string) {
    await this.workspaceDataSourceFactory.destroy(workspaceId);
  }
}
