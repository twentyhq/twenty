import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import {
  type EntitySchemaFieldMetadataMaps,
  type EntitySchemaObjectMetadata,
  type EntitySchemaObjectMetadataMaps,
} from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  create(
    workspaceId: string,
    objectMetadata: EntitySchemaObjectMetadata,
    objectMetadataMaps: EntitySchemaObjectMetadataMaps,
    fieldMetadataMaps: EntitySchemaFieldMetadataMaps,
  ): EntitySchema {
    const columns = this.entitySchemaColumnFactory.create(
      objectMetadata,
      fieldMetadataMaps,
    );

    const relations = this.entitySchemaRelationFactory.create(
      objectMetadata,
      objectMetadataMaps,
      fieldMetadataMaps,
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const entitySchema = new EntitySchema({
      name: objectMetadata.nameSingular,
      tableName: computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      ),
      columns,
      relations,
      schema: schemaName,
    });

    return entitySchema;
  }
}
