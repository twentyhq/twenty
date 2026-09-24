import { type DeferrableWorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export const SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS = [
  'create_index',
  'create_fieldMetadata',
] as const satisfies readonly DeferrableWorkspaceMigrationActionHandlerKey[];
