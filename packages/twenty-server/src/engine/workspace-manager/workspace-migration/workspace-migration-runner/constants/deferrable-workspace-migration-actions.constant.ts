import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS = [
  'create_index',
  'create_fieldMetadata',
  'delete_logicFunction',
] as const satisfies readonly WorkspaceMigrationActionHandlerKey[];
