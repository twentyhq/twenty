import { WorkspaceMigrationObjectFactory } from './workspace-migration-object.factory';
import { WorkspaceMigrationFieldFactory } from './workspace-migration-field.factory';
import { WorkspaceMigrationRelationFactory } from './workspace-migration-relation.factory';

export const workspaceMigrationBuilderFactories = [
  WorkspaceMigrationObjectFactory,
  WorkspaceMigrationFieldFactory,
  WorkspaceMigrationRelationFactory,
];
