import { AsyncLocalStorage } from 'async_hooks';

import { type DeferredWorkspaceMigrationActionsMode } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-actions-mode.type';

const deferredWorkspaceMigrationActionsModeStorage =
  new AsyncLocalStorage<DeferredWorkspaceMigrationActionsMode>();

// Callers that run several migrations back to back or without a worker
// (workspace creation, seeding, upgrade commands) run the slow parts inline.
export const runWithDeferredWorkspaceMigrationActionsMode = <TResult>(
  mode: DeferredWorkspaceMigrationActionsMode,
  fn: () => Promise<TResult>,
): Promise<TResult> =>
  deferredWorkspaceMigrationActionsModeStorage.run(mode, fn);

export const getDeferredWorkspaceMigrationActionsMode =
  (): DeferredWorkspaceMigrationActionsMode =>
    deferredWorkspaceMigrationActionsModeStorage.getStore() ?? 'DEFERRED';
