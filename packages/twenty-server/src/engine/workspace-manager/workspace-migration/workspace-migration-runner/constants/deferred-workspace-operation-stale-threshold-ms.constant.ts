import { DEFERRED_WORKSPACE_OPERATION_STATEMENT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-statement-timeout-ms.constant';

export const DEFERRED_WORKSPACE_OPERATION_STALE_THRESHOLD_MS =
  DEFERRED_WORKSPACE_OPERATION_STATEMENT_TIMEOUT_MS + 15 * 60 * 1000;
