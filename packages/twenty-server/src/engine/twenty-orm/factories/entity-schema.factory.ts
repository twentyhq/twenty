import { Injectable, Type } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  create<T>(target: Type<T>): EntitySchema {
    const objectMetadataArgs = metadataArgsStorage.filterObjects(target);

    if (!objectMetadataArgs) {
      throw new Error('Object metadata args are missing on this target');
    }

    const fieldMetadataArgsCollection =
      metadataArgsStorage.filterFields(target);
    const relationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(target);

    const columns = this.entitySchemaColumnFactory.create(
      fieldMetadataArgsCollection,
    );

    const relations = this.entitySchemaRelationFactory.create(
      relationMetadataArgsCollection,
    );

    return new EntitySchema({
      name: objectMetadataArgs.nameSingular,
      tableName: objectMetadataArgs.nameSingular,
      columns,
      relations,
    });
  }
}
