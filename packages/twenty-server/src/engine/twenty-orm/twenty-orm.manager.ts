import { Injectable } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class TwentyORMManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async getRepository<T extends ObjectLiteral>(
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<T>> {
    const { workspaceId, cacheVersion } =
      this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      workspaceId,
      cacheVersion,
    );

    return workspaceDataSource.getRepository<T>(objectMetadataName);
  }

  async getDatasource() {
    const { workspaceId, cacheVersion } =
      this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    return this.workspaceDataSourceFactory.create(workspaceId, cacheVersion);
  }
}
