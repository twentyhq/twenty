import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';

import { Resolver } from './resolvers-builder.interface';

export interface ResolverBuilderFactoryInterface {
  create(context: SchemaBuilderContext): Resolver;
}
