import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';

export const entitySchemaFactories = [
  EntitySchemaColumnFactory,
  EntitySchemaRelationFactory,
  EntitySchemaFactory,
];
