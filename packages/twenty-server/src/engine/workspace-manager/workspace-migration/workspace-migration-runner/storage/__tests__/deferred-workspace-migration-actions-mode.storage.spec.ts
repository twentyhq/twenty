import {
  getDeferredWorkspaceMigrationActionsMode,
  runWithDeferredWorkspaceMigrationActionsMode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/storage/deferred-workspace-migration-actions-mode.storage';

describe('deferred workspace migration actions mode', () => {
  it('should defer actions outside of any scope', () => {
    expect(getDeferredWorkspaceMigrationActionsMode()).toBe('DEFERRED');
  });

  it('should keep the mode across awaits inside a scope', async () => {
    const mode = await runWithDeferredWorkspaceMigrationActionsMode(
      'IN_PROCESS',
      async () => {
        await Promise.resolve();

        return getDeferredWorkspaceMigrationActionsMode();
      },
    );

    expect(mode).toBe('IN_PROCESS');
    expect(getDeferredWorkspaceMigrationActionsMode()).toBe('DEFERRED');
  });

  it('should let an inner scope override the outer one', async () => {
    const mode = await runWithDeferredWorkspaceMigrationActionsMode(
      'IN_PROCESS',
      () =>
        runWithDeferredWorkspaceMigrationActionsMode('DEFERRED', async () =>
          getDeferredWorkspaceMigrationActionsMode(),
        ),
    );

    expect(mode).toBe('DEFERRED');
  });
});
