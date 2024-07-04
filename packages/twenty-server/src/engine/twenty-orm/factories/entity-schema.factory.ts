import { Injectable, Type } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  create<T>(target: Type<T>): EntitySchema;

  create(objectMetadata: ObjectMetadataEntity): EntitySchema;

  create<T>(
    targetOrObjectMetadata: Type<T> | ObjectMetadataEntity,
  ): EntitySchema {
    if (targetOrObjectMetadata instanceof ObjectMetadataEntity) {
      const columns = this.entitySchemaColumnFactory.createFromObjectMetadata(
        targetOrObjectMetadata.fields,
      );

      return;
    }

    const entityMetadataArgs = metadataArgsStorage.filterEntities(
      targetOrObjectMetadata,
    );

    if (!entityMetadataArgs) {
      throw new Error('Entity metadata args are missing on this target');
    }

    const fieldMetadataArgsCollection = metadataArgsStorage.filterFields(
      targetOrObjectMetadata,
    );
    const joinColumnsMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(targetOrObjectMetadata);
    const relationMetadataArgsCollection = metadataArgsStorage.filterRelations(
      targetOrObjectMetadata,
    );

    const columns = this.entitySchemaColumnFactory.createFromMetadataArgs(
      fieldMetadataArgsCollection,
      relationMetadataArgsCollection,
      joinColumnsMetadataArgsCollection,
    );

    const relations = this.entitySchemaRelationFactory.create(
      targetOrObjectMetadata,
      relationMetadataArgsCollection,
      joinColumnsMetadataArgsCollection,
    );

    const entitySchema = new EntitySchema({
      name: entityMetadataArgs.nameSingular,
      tableName: entityMetadataArgs.nameSingular,
      columns,
      relations,
    });

    ObjectLiteralStorage.setObjectLiteral(entitySchema, targetOrObjectMetadata);

    return entitySchema;
  }
}
