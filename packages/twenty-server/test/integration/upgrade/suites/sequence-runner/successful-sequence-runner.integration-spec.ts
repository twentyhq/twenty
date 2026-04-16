import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';

import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
  resetSeedSequenceCounter,
  seedInstanceMigration,
  seedWorkspaceMigration,
  setMockActiveWorkspaceIds,
  testGetLatestMigrationForCommand,
  WS_1,
  WS_2,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — execution (integration)', () => {
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

  it('should return zero counts for an empty sequence', async () => {
    const report = await context.runner.run({
      sequence: [],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
  });

  it('should resume from a completed instance command and run remaining steps', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeFastInstance('Ic2'),
      makeSlowInstance('Ic3'),
    ];

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic2',
      status: 'completed',
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    const ic1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic1',
    });
    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });
    const ic3 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic3',
    });

    expect(ic1).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );
    expect(ic2).toEqual(
      expect.objectContaining({ status: 'completed', attempt: 1 }),
    );
    expect(ic3).toEqual(expect.objectContaining({ status: 'completed' }));
  });

  it('should retry a failed instance command', async () => {
    const sequence = [makeFastInstance('Ic1'), makeFastInstance('Ic2')];

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic2',
      status: 'failed',
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'completed', attempt: 2 }),
    );
  });

  it('should resume workspace commands from per-workspace cursors', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    const wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });

    expect(wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
  });

  it('should enforce workspace sync barrier before instance step', async () => {
    const sequence = [makeWorkspace('Wc1'), makeFastInstance('Ic1')];

    setMockActiveWorkspaceIds([WS_1]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    const ic1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic1',
    });

    expect(ic1).toEqual(
      expect.objectContaining({ name: 'Ic1', status: 'completed' }),
    );
  });

  it('should skip data migration for slow instance commands when no workspaces exist', async () => {
    const sequence = [makeFastInstance('Ic1'), makeSlowInstance('Ic2')];

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });

    const instanceCommandRunnerService = context.module.get(
      InstanceCommandRunnerService,
    );
    const spy = jest.spyOn(
      instanceCommandRunnerService,
      'runSlowInstanceCommand',
    );

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ skipDataMigration: true }),
    );

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'completed' }),
    );
  });

  it('should run data migration for slow instance commands when workspaces exist', async () => {
    const sequence = [makeFastInstance('Ic0'), makeSlowInstance('Ic1')];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    const instanceCommandRunnerService = context.module.get(
      InstanceCommandRunnerService,
    );
    const spy = jest.spyOn(
      instanceCommandRunnerService,
      'runSlowInstanceCommand',
    );

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ skipDataMigration: false }),
    );

    const ic1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic1',
    });

    expect(ic1).toEqual(
      expect.objectContaining({ name: 'Ic1', status: 'completed' }),
    );
  });

  it('should run workspace commands for multiple workspaces successfully', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

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

    expect(report).toEqual({ totalSuccesses: 2, totalFailures: 0 });

    const ws1Wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });
    const ws2Wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_2,
    });

    expect(ws1Wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
    expect(ws2Wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
  });

  it('should execute the full sequence from the initial cursor on a fresh run', async () => {
    const sequence = [
      makeWorkspace('Wc0'),
      makeFastInstance('Ic1'),
      makeFastInstance('Ic2'),
      makeWorkspace('Wc1'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });
    const wc1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc1',
      workspaceId: WS_1,
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'completed' }),
    );
    expect(wc1).toEqual(
      expect.objectContaining({ name: 'Wc1', status: 'completed' }),
    );
  });

  it('should retry a failed workspace command', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(0);

    const wc1 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc1',
      workspaceId: WS_1,
    });
    const wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });

    expect(wc1).toEqual(
      expect.objectContaining({
        name: 'Wc1',
        status: 'completed',
        attempt: 2,
      }),
    );
    expect(wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
  });

  it('should traverse a multi-segment sequence with sync barriers', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic2'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(0);

    const ic2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Ic2',
    });
    const wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });

    expect(ic2).toEqual(
      expect.objectContaining({ name: 'Ic2', status: 'completed' }),
    );
    expect(wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
  });

  it('should ignore migration records from inactive workspaces when resolving the global cursor', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    // WS_2 is inactive — its record is more recent (seeded later)
    // but should not influence the global cursor
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
    });

    const report = await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(0);

    const wc2 = await testGetLatestMigrationForCommand(context.dataSource, {
      name: 'Wc2',
      workspaceId: WS_1,
    });

    expect(wc2).toEqual(
      expect.objectContaining({ name: 'Wc2', status: 'completed' }),
    );
  });
});
