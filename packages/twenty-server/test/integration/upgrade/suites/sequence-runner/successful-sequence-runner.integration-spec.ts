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
  seedInstanceMigration,
  seedWorkspaceMigration,
  setMockActiveWorkspaceIds,
  testGetExecutedMigrationsInOrder,
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      'Ic2:instance:completed:1',

      // Runner resumes after Ic2, runs Ic3
      'Ic3:instance:completed:1',
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      'Ic2:instance:failed:1',

      // Runner retries Ic2
      'Ic2:instance:completed:2',
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,

      // Runner resumes after Wc1, runs Wc2
      `Wc2:${WS_1}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      `Wc1:${WS_1}:completed:1`,

      // Barrier passes, runner executes Ic1
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',

      // Runner runs Ic2 (slow, no workspaces → skip data migration)
      'Ic2:instance:completed:1',
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,

      // Runner runs Ic1 (slow, workspaces exist → run data migration)
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
      `Wc1:${WS_2}:completed:1`,

      // Both workspaces run Wc2
      `Wc2:${WS_1}:completed:1`,
      `Wc2:${WS_2}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      `Wc0:${WS_1}:completed:1`,
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,

      // Runner resumes after Ic1, runs Ic2 then Wc1
      'Ic2:instance:completed:1',
      `Ic2:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Wc1:${WS_1}:failed:1`,

      // Runner retries Wc1, then runs Wc2
      `Wc1:${WS_1}:completed:2`,
      `Wc2:${WS_1}:completed:1`,
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,

      // Sync barrier → Ic2, then Wc2
      'Ic2:instance:completed:1',
      `Ic2:${WS_1}:completed:1`,
      `Wc2:${WS_1}:completed:1`,
    ]);
  });

  it('should stop before the next instance step when running with workspace filter (-w)', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1],
      },
    });

    expect(report.totalFailures).toBe(0);
    expect(report.totalSuccesses).toBe(1);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,

      // Workspace segment: only WS_1 runs (filtered with -w)
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_1}:completed:1`,

      // Ic2 and Wc3 never reached — runner stopped at instance step boundary
    ]);
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

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_2}:completed:1`,

      // WS_2 is inactive, runner only processes WS_1
      `Wc2:${WS_1}:completed:1`,
    ]);
  });
});
