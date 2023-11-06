import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';

import { Resolver } from './resolvers-builder.interface';

export interface FactoryInterface {
  create(context: SchemaBuilderContext): Resolver;
}
