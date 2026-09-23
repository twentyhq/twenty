import { DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferrable-workspace-migration-actions.constant';
import { SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTION_TYPES } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-deferred-workspace-migration-action-types.constant';

export const SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS =
  DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS.filter((actionHandlerKey) =>
    SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTION_TYPES.some(
      (actionType) => actionHandlerKey.startsWith(`${actionType}_`),
    ),
  );
