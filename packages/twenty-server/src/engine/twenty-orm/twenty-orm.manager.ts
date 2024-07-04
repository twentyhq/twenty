import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';

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
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
  ): Promise<WorkspaceRepository<CustomWorkspaceEntity>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClassOrObjectMetadata: Type<T> | ObjectMetadataEntity,
  ): Promise<
    WorkspaceRepository<T> | WorkspaceRepository<CustomWorkspaceEntity>
  > {
    const entities = ObjectLiteralStorage.getAllEntitySchemas();
    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      entities,
      workspaceId,
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    if (entityClassOrObjectMetadata instanceof ObjectMetadataEntity) {
      if (
        !entityClassOrObjectMetadata.fields ||
        entityClassOrObjectMetadata.fields.length === 0
      ) {
        throw new Error('Object metadata fields not found');
      }

      // TODO: Duplicate code need to refactor this
      const entitySchema = this.entitySchemaFactory.create(
        entityClassOrObjectMetadata,
      );

      return workspaceDataSource.getRepository<CustomWorkspaceEntity>(
        entitySchema,
      );
    }

    const entitySchema = this.entitySchemaFactory.create(
      entityClassOrObjectMetadata,
    );

    return workspaceDataSource.getRepository<T>(entitySchema);
  }
}
