import { WorkspaceMigrationIndexFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-index.factory';

import { WorkspaceMigrationObjectFactory } from './workspace-migration-object.factory';
import { WorkspaceMigrationFieldFactory } from './workspace-migration-field.factory';
import { WorkspaceMigrationRelationFactory } from './workspace-migration-relation.factory';

export const workspaceMigrationBuilderFactories = [
  WorkspaceMigrationObjectFactory,
  WorkspaceMigrationFieldFactory,
  WorkspaceMigrationRelationFactory,
  WorkspaceMigrationIndexFactory,
];
