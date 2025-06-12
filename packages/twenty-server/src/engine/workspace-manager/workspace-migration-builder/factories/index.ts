import { WorkspaceMigrationIndexFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-index.factory';

import { WorkspaceMigrationFieldRelationFactory } from './workspace-migration-field-relation.factory';
import { WorkspaceMigrationFieldFactory } from './workspace-migration-field.factory';
import { WorkspaceMigrationObjectFactory } from './workspace-migration-object.factory';

export const workspaceMigrationBuilderFactories = [
  WorkspaceMigrationObjectFactory,
  WorkspaceMigrationFieldFactory,
  WorkspaceMigrationFieldRelationFactory,
  WorkspaceMigrationIndexFactory,
];
