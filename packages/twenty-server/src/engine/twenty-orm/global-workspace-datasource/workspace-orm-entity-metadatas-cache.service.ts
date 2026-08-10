import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type EntityMetadata, EntitySchema, Repository } from 'typeorm';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { buildEntitySchemaMetadataMaps } from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { type EncodedEntityMetadatas } from 'src/engine/twenty-orm/global-workspace-datasource/types/encoded-entity-metadatas.type';
import { isEntitySchemaRecipe } from 'src/engine/twenty-orm/global-workspace-datasource/utils/is-entity-schema-recipe.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

// The built EntityMetadata graph is ~40k objects for 33 entities and holds
// back-references to the DataSource, so it can never be serialized. Its recipe
// can: EntitySchema.options is plain JSON (127 KB for those same 33 entities,
// 5.3x fewer objects) and rebuilding from it produces a structurally identical
// graph in a few ms. Cold storage keeps the recipe and rebuilds on read.
//
// Held as a JSON string, not an object graph: keeping the parsed recipe alive
// alongside the metadatas would add ~7.7k traced objects per hot entry (+19%),
// which is the thing this is trying to remove. One string costs one node.
const ENTITY_SCHEMA_RECIPE = Symbol('entitySchemaRecipe');

type EntityMetadatasWithRecipe = EntityMetadata[] & {
  [ENTITY_SCHEMA_RECIPE]?: string;
};

@Injectable()
@WorkspaceCache('ORMEntityMetadatas', {
  localDataOnly: true,
  coldStorable: true,
})
export class WorkspaceORMEntityMetadatasCacheService extends WorkspaceCacheProvider<
  EntityMetadata[],
  EncodedEntityMetadatas
> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<EntityMetadata[]> {
    const [objectMetadatas, fieldMetadatas, twentyStandardApplication] =
      await Promise.all([
        this.objectMetadataRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.fieldMetadataRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.applicationRepository.findOne({
          where: {
            workspaceId,
            universalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
      ]);

    const { objectMetadataMaps, fieldMetadataMaps } =
      buildEntitySchemaMetadataMaps(
        objectMetadatas,
        fieldMetadatas,
        twentyStandardApplication?.id,
      );

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

    return this.buildFromEntitySchemas(entitySchemas);
  }

  encodeForCacheStorage(data: EntityMetadata[]): EncodedEntityMetadatas {
    const recipe = (data as EntityMetadatasWithRecipe)[ENTITY_SCHEMA_RECIPE];

    if (!isDefined(recipe)) {
      throw new Error(
        'ORM entity metadatas were built without their schema recipe and cannot be cold stored',
      );
    }

    return JSON.parse(recipe) as EncodedEntityMetadatas;
  }

  decodeFromCacheStorage(
    rawData: EntityMetadata[] | EncodedEntityMetadatas,
  ): EntityMetadata[] {
    if (!Array.isArray(rawData)) {
      throw new Error('Unexpected ORM entity metadatas cache payload');
    }

    // Already-built metadatas are handed straight back; only cold buffers and
    // Redis payloads carry the recipe shape.
    if (rawData.length > 0 && !isEntitySchemaRecipe(rawData[0])) {
      return rawData as EntityMetadata[];
    }

    return this.buildFromEntitySchemas(
      (rawData as EncodedEntityMetadatas).map(
        (options) => new EntitySchema(options),
      ),
    );
  }

  private buildFromEntitySchemas(
    entitySchemas: EntitySchema[],
  ): EntityMetadata[] {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const dataSource =
      this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();

    const entityMetadatas = new EntityMetadataBuilder(
      dataSource as unknown as DataSource,
      metadataArgsStorage,
    ).build();

    Object.defineProperty(entityMetadatas, ENTITY_SCHEMA_RECIPE, {
      value: JSON.stringify(
        entitySchemas.map((entitySchema) => entitySchema.options),
      ),
      enumerable: false,
      configurable: true,
      writable: true,
    });

    return entityMetadatas;
  }
}
