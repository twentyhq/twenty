import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { EntitySchema } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';

@Injectable({ scope: Scope.REQUEST })
export class ScopedWorkspaceDatasourceFactory {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  public async create(entities: EntitySchema[]) {
    const workspace: Workspace | undefined = this.request['req']?.['workspace'];

    if (!workspace) {
      return null;
    }

    return this.workspaceDataSourceFactory.create(entities, workspace.id);
  }
}
