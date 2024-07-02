import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';

@Injectable()
export class TwentyORMUnscopedManager {
  constructor(
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClass: Type<T>,
  ): Promise<WorkspaceRepository<T>> {
    const entities = ObjectLiteralStorage.getAllEntitySchemas();
    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      entities,
      workspaceId,
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const entitySchema = this.entitySchemaFactory.create(entityClass);

    return workspaceDataSource.getRepository<T>(entitySchema);
  }
}
