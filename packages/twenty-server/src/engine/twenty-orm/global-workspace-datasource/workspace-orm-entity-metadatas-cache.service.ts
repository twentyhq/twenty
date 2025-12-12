import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type EntityMetadata, EntitySchema, Repository } from 'typeorm';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildEntitySchemaMetadataMaps } from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('ORMEntityMetadatas', { localDataOnly: true })
export class WorkspaceORMEntityMetadatasCacheService extends WorkspaceCacheProvider<
  EntityMetadata[]
> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<EntityMetadata[]> {
    const [objectMetadatas, fieldMetadatas] = await Promise.all([
      this.objectMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
    ]);

    const { objectMetadataMaps, fieldMetadataMaps } =
      buildEntitySchemaMetadataMaps(objectMetadatas, fieldMetadatas);

    const entitySchemas = Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .map((objectMetadata) =>
        this.entitySchemaFactory.create(
          workspaceId,
          objectMetadata,
          objectMetadataMaps,
          fieldMetadataMaps,
        ),
      );

    const entityMetadatas = await this.buildEntityMetadatas(entitySchemas);

    return entityMetadatas;
  }

  private async buildEntityMetadatas(
    entitySchemas: EntitySchema[],
  ): Promise<EntityMetadata[]> {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const dataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();
    const entityMetadataBuilder = new EntityMetadataBuilder(
      dataSource,
      metadataArgsStorage,
    );

    return entityMetadataBuilder.build();
  }
}
