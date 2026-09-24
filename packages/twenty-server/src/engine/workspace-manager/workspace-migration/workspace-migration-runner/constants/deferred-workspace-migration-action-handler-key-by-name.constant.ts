import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME = {
  buildIndex: 'create_index',
  validateForeignKey: 'create_fieldMetadata',
  deleteLogicFunctionResources: 'delete_logicFunction',
} as const satisfies Record<string, WorkspaceMigrationActionHandlerKey>;
