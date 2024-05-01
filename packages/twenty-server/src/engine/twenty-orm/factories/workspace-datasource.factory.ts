import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, EntitySchema } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceStorage } from 'src/engine/twenty-orm/storage/data-source.storage';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

@Injectable({ scope: Scope.REQUEST })
export class WorkspaceDatasourceFactory {
  constructor(
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async createWorkspaceDatasource(entities: EntitySchema[]) {
    const workspace: Workspace = this.request['req']['workspace'];

    // If there is no workspace, return the core data source
    if (!workspace) {
      return this.coreDataSource;
    }

    const storedWorkspaceDataSource = DataSourceStorage.getDataSource(
      workspace.id,
    );

    if (storedWorkspaceDataSource) {
      return storedWorkspaceDataSource;
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspace.id,
      );

    const workspaceDataSource = new WorkspaceDataSource({
      url:
        dataSourceMetadata.url ??
        this.environmentService.get('PG_DATABASE_URL'),
      type: 'postgres',
      // logging: this.environmentService.get('DEBUG_MODE')
      //   ? ['query', 'error']
      //   : ['error'],
      logging: 'all',
      schema: dataSourceMetadata.schema,
      entities,
    });

    await workspaceDataSource.initialize();

    DataSourceStorage.setDataSource(workspace.id, workspaceDataSource);

    return workspaceDataSource;
  }
}
