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

const DRY_RUN_OPTIONS = { ...DEFAULT_OPTIONS, dryRun: true };

const getDryRunHumanMessages = (logSpy: jest.SpyInstance): string[] =>
  logSpy.mock.calls
    .map(([message]) => String(message).split('\n')[0])
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

  it('should log pending instance steps without running or recording them, then stop before the instance step that follows the simulated workspace segment', async () => {
    const pendingWorkspaceCommand = makeWorkspace('Wc1');
    const nextVersionWorkspaceCommand = makeWorkspace('Wc3');
    const sequence = [
      makeFastInstance('Ic1'),
      makeFastInstance('Ic2'),
      makeSlowInstance('Is3'),
      pendingWorkspaceCommand,
      makeWorkspace('Wc2'),
      makeFastInstance('Ic4'),
      nextVersionWorkspaceCommand,
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
    expect(pendingRunOnWorkspaceSpy).toHaveBeenCalledTimes(2);
    expect(pendingRunOnWorkspaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ dryRun: true }),
      }),
    );
    expect(nextVersionRunOnWorkspaceSpy).not.toHaveBeenCalled();
    expect(getDryRunHumanMessages(logSpy)).toStrictEqual([
      'Dry run: would run fast-instance step "Ic2"',
      'Dry run: would run slow-instance step "Is3"',
      'Dry run stopped before instance step "Ic4": it runs only once every workspace has completed "Wc2", and a dry run does not record workspace progress. A dry run cannot simulate past this point.',
    ]);
    expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
  });

  it('should preview the next version when every workspace has completed the previous workspace segment', async () => {
    const completedWorkspaceCommand = makeWorkspace('Wc0');
    const nextVersionWorkspaceCommand = makeWorkspace('Wc1');
    const sequence = [
      makeFastInstance('Ic0'),
      completedWorkspaceCommand,
      makeFastInstance('Ic1'),
      makeSlowInstance('Is2'),
      nextVersionWorkspaceCommand,
      makeFastInstance('Ic3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });
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

    const { runFastInstanceCommandSpy, runSlowInstanceCommandSpy } =
      spyOnInstanceCommandRunner();
    const completedRunOnWorkspaceSpy = jest.spyOn(
      completedWorkspaceCommand.command,
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

    expect(report).toEqual({ totalSuccesses: 4, totalFailures: 0 });
    expect(runFastInstanceCommandSpy).not.toHaveBeenCalled();
    expect(runSlowInstanceCommandSpy).not.toHaveBeenCalled();
    expect(completedRunOnWorkspaceSpy).not.toHaveBeenCalled();
    expect(nextVersionRunOnWorkspaceSpy).toHaveBeenCalledTimes(2);
    expect(nextVersionRunOnWorkspaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ dryRun: true }),
      }),
    );
    expect(getDryRunHumanMessages(logSpy)).toStrictEqual([
      'Dry run: would run fast-instance step "Ic1"',
      'Dry run: would run slow-instance step "Is2"',
      'Dry run stopped before instance step "Ic3": it runs only once every workspace has completed "Wc1", and a dry run does not record workspace progress. A dry run cannot simulate past this point.',
    ]);
    expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
  });

  it('should fail like a real run when a workspace was already behind the workspace segment before the dry run started', async () => {
    const sequence = [
      makeWorkspace('Wc0a'),
      makeWorkspace('Wc0b'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
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
    const migrationKeysBeforeDryRun = await getMigrationKeys();

    await expect(
      context.runner.run({
        sequence,
        options: DRY_RUN_OPTIONS,
      }),
    ).rejects.toThrow('Cannot run instance step');

    expect(runFastInstanceCommandSpy).not.toHaveBeenCalled();
    expect(await getMigrationKeys()).toStrictEqual(migrationKeysBeforeDryRun);
  });
});
