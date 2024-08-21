import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';
import { v4 } from 'uuid';

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
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntityOrobjectMetadataName: Type<T> | string,
  ): Promise<WorkspaceRepository<T>> {
    let objectMetadataName: string;

    if (typeof workspaceEntityOrobjectMetadataName === 'string') {
      objectMetadataName = workspaceEntityOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        workspaceEntityOrobjectMetadataName.name,
      );
    }

    const logId = v4();

    console.time(`createDataSource in orm ${logId}`);
    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      workspaceId,
      null,
    );

    console.timeEnd(`createDataSource in orm ${logId}`);

    const repository = workspaceDataSource.getRepository<T>(objectMetadataName);

    return repository;
  }

  async getDataSourceForWorkspace(workspaceId: string) {
    return this.workspaceDataSourceFactory.create(workspaceId, null);
  }
}
