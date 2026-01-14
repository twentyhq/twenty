import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreateDatabaseEventTriggerAction =
  BaseCreateWorkspaceMigrationAction<'databaseEventTrigger'>;

export type UpdateDatabaseEventTriggerAction =
  BaseUpdateWorkspaceMigrationAction<'databaseEventTrigger'>;

export type DeleteDatabaseEventTriggerAction =
  BaseDeleteWorkspaceMigrationAction<'databaseEventTrigger'>;
