import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeWorkspace,
  migrationRecordToKey,
  resetSeedSequenceCounter,
  seedInstanceMigration,
  setMockActiveWorkspaceIds,
  testGetExecutedMigrationsInOrder,
  WS_1,
  WS_2,
  WS_3,
  WS_4,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

// Sorted ASC: WS_1 < WS_2 < WS_3 < WS_4

describe('UpgradeSequenceRunnerService — startFromWorkspaceId (integration)', () => {
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

  it('should only process workspaces whose id >= startFromWorkspaceId', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2, WS_3],
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        startFromWorkspaceId: WS_2,
      },
    });

    expect(report.totalFailures).toBe(0);
    expect(report.totalSuccesses).toBe(2);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Ic1:${WS_3}:completed:1`,

      // Only WS_2 and WS_3 are processed (WS_1 skipped)
      `Wc1:${WS_2}:completed:1`,
      `Wc2:${WS_2}:completed:1`,
      `Wc1:${WS_3}:completed:1`,
      `Wc2:${WS_3}:completed:1`,
    ]);
  });

  it('should respect workspaceCountLimit together with startFromWorkspaceId', async () => {
    const sequence = [makeFastInstance('Ic1'), makeWorkspace('Wc1')];

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3, WS_4]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2, WS_3, WS_4],
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        startFromWorkspaceId: WS_2,
        workspaceCountLimit: 1,
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
      `Ic1:${WS_3}:completed:1`,
      `Ic1:${WS_4}:completed:1`,

      // Only WS_2 processed (first after startFrom, limited to 1)
      `Wc1:${WS_2}:completed:1`,
    ]);
  });

  it('should stop before instance step when startFromWorkspaceId is set', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2, WS_3],
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        startFromWorkspaceId: WS_2,
      },
    });

    expect(report.totalFailures).toBe(0);
    expect(report.totalSuccesses).toBe(2);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Ic1:${WS_3}:completed:1`,

      // Workspace segment: only WS_2 and WS_3 run
      `Wc1:${WS_2}:completed:1`,
      `Wc2:${WS_2}:completed:1`,
      `Wc1:${WS_3}:completed:1`,
      `Wc2:${WS_3}:completed:1`,

      // Ic2 and Wc3 never reached — runner stopped at instance step boundary
    ]);
  });

  it('should process no workspaces when startFromWorkspaceId is greater than all ids', async () => {
    const sequence = [makeFastInstance('Ic1'), makeWorkspace('Wc1')];

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
        startFromWorkspaceId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      },
    });

    expect(report.totalFailures).toBe(0);
    expect(report.totalSuccesses).toBe(0);
  });
});
