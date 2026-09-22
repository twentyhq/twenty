import { DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-statement-timeout-ms.constant';

// Past the statement timeout Postgres has cancelled the action's statement, so
// an IN_PROGRESS row older than this belongs to a worker that died mid-run.
export const DEFERRED_WORKSPACE_MIGRATION_ACTION_STRANDED_THRESHOLD_MS =
  DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS + 15 * 60 * 1000;
