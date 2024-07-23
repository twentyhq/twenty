import { Injectable } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class TwentyORMGlobalManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<T>> {
    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      workspaceId,
      null,
    );

    return workspaceDataSource.getRepository<T>(objectMetadataName);
  }

  async getDataSourceForWorkspace(workspaceId: string) {
    return this.workspaceDataSourceFactory.create(workspaceId, null);
  }
}
