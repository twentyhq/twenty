import { Injectable, Type } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  create<T>(target: Type<T>): EntitySchema {
    const entityMetadataArgs = metadataArgsStorage.filterEntities(target);

    if (!entityMetadataArgs) {
      throw new Error('Entity metadata args are missing on this target');
    }

    const fieldMetadataArgsCollection =
      metadataArgsStorage.filterFields(target);
    const relationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(target);

    const columns = this.entitySchemaColumnFactory.create(
      fieldMetadataArgsCollection,
      relationMetadataArgsCollection,
    );

    const relations = this.entitySchemaRelationFactory.create(
      target,
      relationMetadataArgsCollection,
    );

    const entitySchema = new EntitySchema({
      name: entityMetadataArgs.nameSingular,
      tableName: entityMetadataArgs.nameSingular,
      columns,
      relations,
    });

    ObjectLiteralStorage.setObjectLiteral(entitySchema, target);

    return entitySchema;
  }
}
