import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  async create(
    workspaceId: string,
    metadataVersion: number,
    objectMetadata: ObjectMetadataMapItem,
    objectMetadataMap: ObjectMetadataMap,
  ): Promise<EntitySchema> {
    const columns = this.entitySchemaColumnFactory.create(
      objectMetadata.fields,
    );

    const relations = await this.entitySchemaRelationFactory.create(
      objectMetadata.fields,
      objectMetadataMap,
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
