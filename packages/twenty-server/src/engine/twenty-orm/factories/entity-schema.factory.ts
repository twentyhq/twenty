import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    objectMetadata: ObjectMetadataEntity,
  ): Promise<EntitySchema> {
    const columns = this.entitySchemaColumnFactory.create(
      objectMetadata.fields,
      objectMetadata.softDelete ?? false,
    );

    const relations = await this.entitySchemaRelationFactory.create(
      workspaceId,
      objectMetadata.fields,
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
