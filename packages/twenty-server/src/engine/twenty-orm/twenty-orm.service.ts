import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral, Repository } from 'typeorm';

import { FlattenCompositeTypes } from 'src/engine/twenty-orm/interfaces/flatten-composite-types.interface';

import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

@Injectable()
export class TwentyORMService {
  constructor(
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  getRepository<T extends ObjectLiteral>(
    entityClass: Type<T>,
  ): Repository<FlattenCompositeTypes<T>> {
    const entitySchema = this.entitySchemaFactory.create(entityClass);

    return this.workspaceDataSource.getRepository<FlattenCompositeTypes<T>>(
      entitySchema,
    );
  }
}
