import { AsyncLocalStorage } from 'async_hooks';

import { type DeferredWorkspaceMigrationActionsMode } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-actions-mode.type';

const deferredWorkspaceMigrationActionsModeStorage =
  new AsyncLocalStorage<DeferredWorkspaceMigrationActionsMode>();

// IN_PROCESS is for callers that chain migrations or run without a worker.
export const runWithDeferredWorkspaceMigrationActionsMode = <TResult>(
  mode: DeferredWorkspaceMigrationActionsMode,
  fn: () => Promise<TResult>,
): Promise<TResult> =>
  deferredWorkspaceMigrationActionsModeStorage.run(mode, fn);

export const getDeferredWorkspaceMigrationActionsMode =
  (): DeferredWorkspaceMigrationActionsMode =>
    deferredWorkspaceMigrationActionsModeStorage.getStore() ?? 'DEFERRED';
