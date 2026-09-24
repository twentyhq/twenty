import { type DeferredWorkspaceMigrationActionName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export const SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS = [
  'buildIndex',
  'validateForeignKey',
] as const satisfies readonly DeferredWorkspaceMigrationActionName[];
