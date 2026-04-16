import {
  type UpgradeStep,
  type WorkspaceUpgradeStep,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeStep,
  makeWorkspace,
  resetSeedSequenceCounter,
  seedInstanceMigration,
  seedWorkspaceMigration,
  setMockActiveWorkspaceIds,
  testGetLatestMigrationForCommand,
  WS_1,
  WS_2,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

const makeFailingFastInstance = (name: string, error: Error): UpgradeStep =>
  ({
    ...makeStep('fast-instance', name),
    command: {
      up: async () => {
        throw error;
      },
      down: async () => {},
    },
  }) as unknown as UpgradeStep;

const makeFailingWorkspace = (
  name: string,
  error: Error,
): WorkspaceUpgradeStep =>
  ({
    ...makeStep('workspace', name),
    command: {
      runOnWorkspace: async () => {
        throw error;
      },
    },
  }) as unknown as WorkspaceUpgradeStep;

const makeWorkspaceFailingForIds = (
  name: string,
  failingWorkspaceIds: Set<string>,
  error: Error,
): WorkspaceUpgradeStep =>
  ({
    ...makeStep('workspace', name),
    command: {
      runOnWorkspace: async ({ workspaceId }: { workspaceId: string }) => {
        if (failingWorkspaceIds.has(workspaceId)) {
          throw error;
        }
      },
    },
  }) as unknown as WorkspaceUpgradeStep;

describe('UpgradeSequenceRunnerService — failing sequence (integration)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule();
  }, 30000);

  afterAll(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    await context.module?.close();
    await context.dataSource?.destroy();
  }, 15000);

  beforeEach(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([]);
    jest.restoreAllMocks();
  });

  it('should throw when no migration history exists', async () => {
    const sequence = [makeFastInstance('Ic1')];

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow(
      'No upgrade migration found — the database may not have been initialized',
    );
  });

  it('should throw when cursor command is not found in the sequence', async () => {
    const sequence = [makeFastInstance('Ic1'), makeFastInstance('Ic2')];

    await seedInstanceMigration(context.dataSource, {
      name: 'RemovedCommand',
      status: 'completed',
    });

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw when workspace cursors are outside the current slice', async () => {
    const sequence = [
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc3',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc4',
      status: 'completed',
      workspaceId: WS_1,
    });

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow(
      'workspace(s) have invalid cursors for workspace segment',
    );
  });

  it('should throw when an active workspace has no migration history', async () => {
    const sequence = [makeFastInstance('Ic1'), makeWorkspace('Wc1')];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('No upgrade migration found for workspace(s)');
  });

  it('should record failure in DB when a fast instance command fails', async () => {
    const error = new Error('fast command exploded');
    const sequence = [
      makeFastInstance('Ic1'),
      makeFailingFastInstance('Ic2', error),
    ];

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('fast command exploded');

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'failed' }),
    );
  });

  it('should record failure in DB when a slow instance command fails', async () => {
    const error = new Error('slow data migration exploded');
    const sequence = [
      makeFastInstance('Ic1'),
      {
        ...makeSlowInstance('Ic2'),
        command: {
          up: async () => {},
          down: async () => {},
          runDataMigration: async () => {
            throw error;
          },
        },
      } as unknown as UpgradeStep,
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    await expect(
      context.runner.run({
        sequence,
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('slow data migration exploded');

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'failed' }),
    );
  });

  it('should abort and report failures when workspace commands fail, without running subsequent instance steps', async () => {
    const error = new Error('workspace command exploded');
    const sequence = [
      makeFailingWorkspace('Wc1', error),
      makeFastInstance('Ic1'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(1);
    expect(report.totalSuccesses).toBe(0);

    const ic1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic1',
    });

    expect(ic1).toBeNull();

    const wc1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc1',
      workspaceId: WS_1,
    });

    expect(wc1).toEqual(
      expect.objectContaining({ status: 'failed', attempt: 2 }),
    );
  });

  it('should abort at workspace failure in a multi-segment sequence with two workspaces starting aligned', async () => {
    const error = new Error('Wc2 exploded for WS_2');

    const sequence = [
      makeWorkspace('Wc0'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspaceFailingForIds('Wc2', new Set([WS_2]), error),
      makeFastInstance('Ic2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_2,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2],
      },
    });

    expect(report.totalSuccesses).toBe(1);
    expect(report.totalFailures).toBe(1);

    // WS_1 succeeded Wc2
    const ws1Wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });

    expect(ws1Wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );

    // WS_2 failed Wc2
    const ws2Wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_2,
    });

    expect(ws2Wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'failed' }),
    );

    // Ic2 never ran — runner aborted at the workspace segment failure
    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });

    expect(ic2).toBeNull();

    // Wc3 never ran either
    const ws1Wc3 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc3',
      workspaceId: WS_1,
    });

    expect(ws1Wc3).toBeNull();
  });
});
