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
  migrationRecordToKey,
  resetSeedSequenceCounter,
  seedInstanceMigration,
  seedWorkspaceMigration,
  setMockActiveWorkspaceIds,
  testGetExecutedMigrationsInOrder,
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
    ).rejects.toThrow(/Step "RemovedCommand" not found in upgrade sequence/);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',

      // Ic2 attempted and failed
      'Ic2:instance:failed:1',
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,

      // Ic2 attempted and failed
      'Ic2:instance:failed:1',
      `Ic2:${WS_1}:failed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      `Wc1:${WS_1}:failed:1`,

      // Runner retries Wc1, still fails — Ic1 never reached
      `Wc1:${WS_1}:failed:2`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      `Wc0:${WS_1}:completed:1`,
      `Wc0:${WS_2}:completed:1`,
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
      `Wc1:${WS_2}:completed:1`,

      // WS_1 succeeds Wc2, WS_2 fails Wc2
      `Wc2:${WS_1}:completed:1`,
      `Wc2:${WS_2}:failed:1`,

      // Ic2 and Wc3 never reached — runner aborted at workspace failure
    ]);
  });
});
