import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME = {
  build_index: 'create_index',
  validate_foreignKey: 'create_fieldMetadata',
  delete_logicFunctionResources: 'delete_logicFunction',
} as const satisfies Record<string, WorkspaceMigrationActionHandlerKey>;
