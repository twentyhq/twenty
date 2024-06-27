import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { EntitySchema } from 'typeorm';

import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';

@Injectable({ scope: Scope.REQUEST })
export class ScopedWorkspaceDatasourceFactory {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  public async create(entities: EntitySchema[]) {
    const workspaceId: string | undefined =
      this.request?.['req']?.['workspaceId'];

    if (!workspaceId) {
      return null;
    }

    return this.workspaceDataSourceFactory.create(entities, workspaceId);
  }
}
