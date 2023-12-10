import { WorkspaceSchemaBuilderContext } from 'src/workspace/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { Resolver } from './workspace-resolvers-builder.interface';

export interface WorkspaceResolverBuilderFactoryInterface {
  create(context: WorkspaceSchemaBuilderContext): Resolver;
}
