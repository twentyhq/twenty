import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';

@Injectable()
export class TwentyORMManager {
  constructor(
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  getRepository<T extends ObjectLiteral>(
    entityClass: Type<T>,
  ): WorkspaceRepository<T> {
    const entitySchema = this.entitySchemaFactory.create(entityClass);

    return this.workspaceDataSource.getRepository<T>(entitySchema);
  }

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
