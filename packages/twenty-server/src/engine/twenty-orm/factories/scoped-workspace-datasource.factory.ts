import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { EntitySchema } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';

@Injectable({ scope: Scope.REQUEST })
export class ScopedWorkspaceDatasourceFactory {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  public async create(entities: EntitySchema[]) {
    const workspace: Workspace | undefined = this.request['req']['workspace'];

    // Need to define what is the best behavior here, for now we are returning a new datasource with base url
    if (!workspace) {
      return new WorkspaceDataSource({
        url: this.environmentService.get('PG_DATABASE_URL'),
        type: 'postgres',
        logging: 'all',
        entities,
      });
    }

    return this.workspaceDataSourceFactory.create(entities, workspace.id);
  }
}
