import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async create(
    workspaceId: string,
    _metadataVersion: number,
    objectMetadata: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<EntitySchema> {
    const columns = this.entitySchemaColumnFactory.create(objectMetadata);

    const relations = await this.entitySchemaRelationFactory.create(
      objectMetadata,
      objectMetadataMaps,
    );

    const entitySchema = new EntitySchema({
      name: objectMetadata.nameSingular,
      tableName: computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      ),
      columns,
      relations,
    });

    WorkspaceEntitiesStorage.setEntitySchema(
      workspaceId,
      objectMetadata.nameSingular,
      entitySchema,
    );

    return entitySchema;
  }
}
