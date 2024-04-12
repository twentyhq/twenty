import { Injectable, Type } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  create<T>(target: Type<T>): EntitySchema {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', target);

    if (!objectMetadata) {
      throw new Error('ObjectMetadata is missing on the target entity');
    }

    const fieldMetadataMap =
      TypedReflect.getMetadata('fieldMetadataMap', target) || {};
    const relationMetadataCollection =
      TypedReflect.getMetadata('reflectRelationMetadataCollection', target) ||
      [];

    const columns = this.entitySchemaColumnFactory.create(fieldMetadataMap);

    const relations = this.entitySchemaRelationFactory.create(
      target,
      relationMetadataCollection,
    );

    return new EntitySchema({
      name: objectMetadata.nameSingular,
      columns,
      relations,
    });
  }
}
