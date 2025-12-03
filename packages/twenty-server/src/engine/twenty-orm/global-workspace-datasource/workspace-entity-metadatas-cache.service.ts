import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type EntityMetadata, EntitySchema, Repository } from 'typeorm';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('entityMetadatas', { localOnly: true })
export class WorkspaceEntityMetadatasCacheService extends WorkspaceCacheProvider<
  EntityMetadata[]
> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      this.buildFlatMaps(objectMetadatas, fieldMetadatas);

    const entitySchemas = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .map((flatObjectMetadata) =>
        this.entitySchemaFactory.create(
          workspaceId,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        ),
      );

    return this.buildEntityMetadatas(entitySchemas);
  }

  private buildFlatMaps(
    objectMetadatas: ObjectMetadataEntity[],
    fieldMetadatas: FieldMetadataEntity[],
  ): {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  } {
    const fieldIdsByObjectId = new Map<string, string[]>();

    for (const field of fieldMetadatas) {
      const existing = fieldIdsByObjectId.get(field.objectMetadataId);

      if (existing) {
        existing.push(field.id);
      } else {
        fieldIdsByObjectId.set(field.objectMetadataId, [field.id]);
      }
    }

    const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    for (const object of objectMetadatas) {
      const universalIdentifier = object.standardId ?? object.id;

      flatObjectMetadataMaps.byId[object.id] = {
        ...object,
        fieldMetadataIds: fieldIdsByObjectId.get(object.id) ?? [],
        indexMetadataIds: [],
        viewIds: [],
        universalIdentifier,
      } as unknown as FlatObjectMetadata;
    }

    const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    for (const field of fieldMetadatas) {
      const universalIdentifier = field.standardId ?? field.id;

      flatFieldMetadataMaps.byId[field.id] = {
        ...field,
        viewFieldIds: [],
        viewFilterIds: [],
        viewGroupIds: [],
        calendarViewIds: [],
        kanbanAggregateOperationViewIds: [],
        universalIdentifier,
      } as unknown as FlatFieldMetadata;
    }

    return { flatObjectMetadataMaps, flatFieldMetadataMaps };
  }

  private buildEntityMetadatas(
    entitySchemas: EntitySchema[],
  ): EntityMetadata[] {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const entityMetadataBuilder = new EntityMetadataBuilder(
      this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource(),
      metadataArgsStorage,
    );

    return entityMetadataBuilder.build();
  }
}
