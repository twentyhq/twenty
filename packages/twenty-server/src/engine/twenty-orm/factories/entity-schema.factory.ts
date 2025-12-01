import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
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
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): EntitySchema {
    const columns = this.entitySchemaColumnFactory.create(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    const relations = this.entitySchemaRelationFactory.create(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const entitySchema = new EntitySchema({
      name: flatObjectMetadata.nameSingular,
      tableName: computeTableName(
        flatObjectMetadata.nameSingular,
        flatObjectMetadata.isCustom,
      ),
      columns,
      relations,
      schema: schemaName,
    });

    return entitySchema;
  }
}
