import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';

import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
  migrationRecordToKey,
  resetSeedSequenceCounter,
  restoreUpgradeMigrations,
  seedInstanceMigration,
  seedWorkspaceMigration,
  setMockActiveWorkspaceIds,
  snapshotUpgradeMigrations,
  testGetExecutedMigrationsInOrder,
  WS_1,
  WS_2,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const DRY_RUN_OPTIONS = { ...DEFAULT_OPTIONS, dryRun: true };

const getDryRunHumanMessages = (logSpy: jest.SpyInstance): string[] =>
  logSpy.mock.calls
    .map(([message]) => {
      const firstSegment = String(message).split('\n')[0];

      jestExpectToBeDefined(firstSegment);

      return firstSegment;
    })
    .filter((humanMessage) => humanMessage.startsWith('Dry run'));

describe('UpgradeSequenceRunnerService - dry run (integration)', () => {
  let context: IntegrationTestContext;
  let savedUpgradeMigrations: Awaited<
    ReturnType<typeof snapshotUpgradeMigrations>
  >;

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule();
    savedUpgradeMigrations = await snapshotUpgradeMigrations(
      context.dataSource,
    );
  }, 30000);

  afterAll(async () => {
    await restoreUpgradeMigrations(context.dataSource, savedUpgradeMigrations);
    await context.module?.close();
    await context.dataSource?.destroy();
  }, 15000);

  beforeEach(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([]);
    jest.restoreAllMocks();
  });

  const getMigrationKeys = async () =>
    (await testGetExecutedMigrationsInOrder(context.dataSource)).map(
      migrationRecordToKey,
    );

  const spyOnInstanceCommandRunner = () => {
    const instanceCommandRunnerService = context.module.get(
      InstanceCommandRunnerService,
    );

    return {
      runFastInstanceCommandSpy: jest.spyOn(
        instanceCommandRunnerService,
        'runFastInstanceCommand',
      ),
      runSlowInstanceCommandSpy: jest.spyOn(
        instanceCommandRunnerService,
        'runSlowInstanceCommand',
      ),
    };
  };

  it.each([
    ['fast', makeFastInstance],
    ['slow', makeSlowInstance],
  ] as const)(
    'should stop before a pending %s instance command without running later workspace commands',
    async (_, makeInstance) => {
      const pendingWorkspaceCommand = makeWorkspace('Wc1');
      const sequence = [
        makeFastInstance('Ic1'),
        makeInstance('Ic2'),
        pendingWorkspaceCommand,
      ];

      setMockActiveWorkspaceIds([WS_1, WS_2]);

      await seedInstanceMigration(context.dataSource, {
        name: 'Ic1',
        status: 'completed',
        workspaceIds: [WS_1, WS_2],
      });

      const { runFastInstanceCommandSpy, runSlowInstanceCommandSpy } =
        spyOnInstanceCommandRunner();
      const pendingRunOnWorkspaceSpy = jest.spyOn(
        pendingWorkspaceCommand.command,
        'runOnWorkspace',
      );
      const logSpy = jest
        .spyOn(context.runner['logger'], 'log')
        .mockImplementation();
      const migrationKeysBeforeDryRun = await getMigrationKeys();

      const report = await context.runner.run({
        sequence,
        options: DRY_RUN_OPTIONS,
      });

      expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
      expect(runFastInstanceCommandSpy).not.toHaveBeenCalled();
      expect(runSlowInstanceCommandSpy).not.toHaveBeenCalled();
      expect(pendingRunOnWorkspaceSpy).not.toHaveBeenCalled();
      expect(getDryRunHumanMessages(logSpy)).toStrictEqual([
        'Dry run stopped before instance step "Ic2": instance commands cannot run in dry-run mode.',
      ]);
      expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
    },
  );

  it.each(['completed', 'failed'] as const)(
    'should stop before the next instance command when the current workspace segment was %s',
    async (status) => {
      const currentWorkspaceCommand = makeWorkspace('Wc0');
      const nextVersionWorkspaceCommand = makeWorkspace('Wc1');
      const sequence = [
        makeFastInstance('Ic0'),
        currentWorkspaceCommand,
        makeFastInstance('Ic1'),
        nextVersionWorkspaceCommand,
      ];

      setMockActiveWorkspaceIds([WS_1, WS_2]);

      await seedInstanceMigration(context.dataSource, {
        name: 'Ic0',
        status: 'completed',
        workspaceIds: [WS_1, WS_2],
      });
      await seedWorkspaceMigration(context.dataSource, {
        name: 'Wc0',
        status,
        workspaceId: WS_1,
      });
      await seedWorkspaceMigration(context.dataSource, {
        name: 'Wc0',
        status,
        workspaceId: WS_2,
      });

      const { runFastInstanceCommandSpy, runSlowInstanceCommandSpy } =
        spyOnInstanceCommandRunner();
      const currentRunOnWorkspaceSpy = jest.spyOn(
        currentWorkspaceCommand.command,
        'runOnWorkspace',
      );
      const nextVersionRunOnWorkspaceSpy = jest.spyOn(
        nextVersionWorkspaceCommand.command,
        'runOnWorkspace',
      );
      const logSpy = jest
        .spyOn(context.runner['logger'], 'log')
        .mockImplementation();
      const migrationKeysBeforeDryRun = await getMigrationKeys();

      const report = await context.runner.run({
        sequence,
        options: DRY_RUN_OPTIONS,
      });

      expect(report).toEqual({ totalSuccesses: 2, totalFailures: 0 });
      expect(runFastInstanceCommandSpy).not.toHaveBeenCalled();
      expect(runSlowInstanceCommandSpy).not.toHaveBeenCalled();
      if (status === 'completed') {
        expect(currentRunOnWorkspaceSpy).not.toHaveBeenCalled();
      } else {
        expect(currentRunOnWorkspaceSpy).toHaveBeenCalledTimes(2);
        expect(currentRunOnWorkspaceSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({ dryRun: true }),
          }),
        );
      }
      expect(nextVersionRunOnWorkspaceSpy).not.toHaveBeenCalled();
      expect(getDryRunHumanMessages(logSpy)).toStrictEqual([
        'Dry run stopped before instance step "Ic1": instance commands cannot run in dry-run mode.',
      ]);
      expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
    },
  );

  it('should stop before checking the workspace barrier when retrying a failed instance command', async () => {
    const pendingWorkspaceCommand = makeWorkspace('Wc1');
    const sequence = [
      makeWorkspace('Wc0a'),
      makeWorkspace('Wc0b'),
      makeFastInstance('Ic1'),
      pendingWorkspaceCommand,
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0a',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0a',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0b',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'failed',
      workspaceIds: [WS_2],
    });

    const { runFastInstanceCommandSpy } = spyOnInstanceCommandRunner();
    const pendingRunOnWorkspaceSpy = jest.spyOn(
      pendingWorkspaceCommand.command,
      'runOnWorkspace',
    );
    const migrationKeysBeforeDryRun = await getMigrationKeys();

    await expect(
      context.runner.run({
        sequence,
        options: DRY_RUN_OPTIONS,
      }),
    ).resolves.toEqual({ totalSuccesses: 0, totalFailures: 0 });

    expect(runFastInstanceCommandSpy).not.toHaveBeenCalled();
    expect(pendingRunOnWorkspaceSpy).not.toHaveBeenCalled();
    expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
  });
});
