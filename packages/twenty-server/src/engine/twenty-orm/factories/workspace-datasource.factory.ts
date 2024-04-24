import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { DataSource, EntitySchema } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable({ scope: Scope.REQUEST })
export class WorkspaceDatasourceFactory {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async createWorkspaceDatasource(entities: EntitySchema[]) {
    const workspace = this.request['req']['workspace'];

    if (!workspace) {
      return null;
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspace.id,
      );

    const workspaceDataSource = new DataSource({
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

    return workspaceDataSource;
  }
}
