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
  WS_3,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — workspace segment alignment (integration)', () => {
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

  it('should upgrade all workspaces when they are in the same segment at different positions', async () => {
    // Sequence: Ic0 → Wc0 → Wc1 → Wc2 → Ic1 → Ic2 → Wc3 → Wc4
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeSlowInstance('Ic2'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1, WS_2, WS_3],
    });

    // WS_1: at Wc0, completed
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc1, failed (needs retry)
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_2,
    });

    // WS_3: at Wc2, completed (most advanced in segment)
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_3,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_3,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_3,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2, WS_3],
      },
    });

    expect(report.totalFailures).toBe(0);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds (Ic0 global + workspace rows inserted at same timestamp)
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,
      `Ic0:${WS_2}:completed:1`,
      `Ic0:${WS_3}:completed:1`,
      `Wc0:${WS_1}:completed:1`,
      `Wc0:${WS_2}:completed:1`,
      `Wc1:${WS_2}:failed:1`,
      `Wc0:${WS_3}:completed:1`,
      `Wc1:${WS_3}:completed:1`,
      `Wc2:${WS_3}:completed:1`,

      // Segment A: WS_1 runs Wc1, Wc2; WS_2 retries Wc1, runs Wc2; WS_3 already done
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_1}:completed:1`,
      `Wc1:${WS_2}:completed:2`,
      `Wc2:${WS_2}:completed:1`,

      // Sync barrier → instance steps (with workspace-level rows)
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Ic1:${WS_3}:completed:1`,
      'Ic2:instance:completed:1',
      `Ic2:${WS_1}:completed:1`,
      `Ic2:${WS_2}:completed:1`,
      `Ic2:${WS_3}:completed:1`,

      // Segment B: all workspaces run Wc3, Wc4
      `Wc3:${WS_1}:completed:1`,
      `Wc4:${WS_1}:completed:1`,
      `Wc3:${WS_2}:completed:1`,
      `Wc4:${WS_2}:completed:1`,
      `Wc3:${WS_3}:completed:1`,
      `Wc4:${WS_3}:completed:1`,
    ]);
  });

  it('should reject workspaces with cursors ahead of the current segment', async () => {
    // Sequence: Ic0 → Wc0 → Wc1 → Ic1 → Wc2 → Wc3
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    // WS_1 existed when Ic0 ran; WS_2 was created later (initial at Wc2)
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    // WS_1: at Wc0 (in segment A) - correct
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc2 (in segment B) - WRONG! Ahead of current segment
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
      isInitial: true,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have invalid cursors for workspace segment/,
    );
  });

  it('should reject workspaces with cursors behind the current segment', async () => {
    // Sequence: Wc-1 → Ic0 → Wc0 → Wc1 → Ic1 → Wc2
    const sequence = [
      makeWorkspace('Wc-1'),
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });

    // WS_1: at Wc0 (in segment after Ic0) - correct
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc-1 (in segment before Ic0) - WRONG! Behind current segment
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc-1',
      status: 'completed',
      workspaceId: WS_2,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have invalid cursors for workspace segment/,
    );
  });

  it('should handle workspaces created at correct segment via isInitial', async () => {
    // Sequence: Wc0 → Ic0 → Ic1 → Wc1 → Wc2
    // WS_1 existed from the start, WS_2 was created after Ic1
    const sequence = [
      makeWorkspace('Wc0'),
      makeFastInstance('Ic0'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    // WS_1: at Wc1 (in correct segment after Ic1)
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: newly created with isInitial at Wc2 (correct segment after Ic1)
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
      isInitial: true,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2],
      },
    });

    expect(report.totalFailures).toBe(0);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_2}:completed:1:initial`,

      // WS_1 runs Wc2, WS_2 already at Wc2 (no new commands needed)
      `Wc2:${WS_1}:completed:1`,
    ]);
  });

  it('should accept workspaces at the preceding completed IC when others are in the WC segment (-w scenario)', async () => {
    // Sequence: Ic0 → Ic1 → Wc0 → Wc1
    // WS_1 was upgraded via -w and is at Wc1:completed
    // WS_2 is still at Ic1:completed (preceding IC)
    const sequence = [
      makeFastInstance('Ic0'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });

    // WS_1 was upgraded ahead via -w
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2],
      },
    });

    expect(report.totalFailures).toBe(0);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,
      `Ic0:${WS_2}:completed:1`,
      'Ic1:instance:completed:1',
      `Ic1:${WS_1}:completed:1`,
      `Ic1:${WS_2}:completed:1`,
      `Wc0:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,

      // WS_2 runs full segment, WS_1 already done
      `Wc0:${WS_2}:completed:1`,
      `Wc1:${WS_2}:completed:1`,
    ]);
  });

  it('should reject workspace at preceding IC with failed status', async () => {
    // Sequence: Ic0 → Wc0 → Wc1
    // WS_1 is in the WC segment, WS_2 is at Ic0:failed
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1],
    });

    // WS_2 at Ic0:failed — should be rejected
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'failed',
      workspaceId: WS_2,
    });

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have invalid cursors for workspace segment/,
    );
  });

  it('should reject workspace stuck in a previous WC segment (corrupted state)', async () => {
    // Sequence: Wc0 → Wc1 → Ic0 → Wc2 → Wc3
    // WS_1 is in segment [Wc2..Wc3], WS_2 is stuck at Wc0 (previous WC segment)
    const sequence = [
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic0'),
      makeWorkspace('Wc2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1],
    });
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2 stuck at Wc0 in previous WC segment — corrupted
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_2,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have invalid cursors for workspace segment/,
    );
  });

  it('should write workspace rows for IC failure, accept workspace created mid-failure, and succeed on restart', async () => {
    // Sequence: Ic0 → Ic1 → Wc0 → Wc1
    // First run: Ic1 fails → global + workspace rows written as failed
    // WS_3 is created while Ic1 is failed → initial cursor at Ic1:failed
    // Second run: Ic1 retries and succeeds → WC segment runs for all 3 workspaces
    const failOnce = { shouldFail: true };

    const ic1Command = {
      up: async () => {
        if (failOnce.shouldFail) {
          failOnce.shouldFail = false;
          throw new Error('Ic1 temporary failure');
        }
      },
      down: async () => {},
    };

    const sequence = [
      makeFastInstance('Ic0'),
      {
        ...makeFastInstance('Ic1'),
        command: ic1Command,
      } as unknown as ReturnType<typeof makeFastInstance>,
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    await seedInstanceMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
      workspaceIds: [WS_1, WS_2],
    });

    // First run — Ic1 fails
    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow('Ic1 temporary failure');

    const afterFailure = await testGetExecutedMigrationsInOrder(
      context.dataSource,
    );

    expect(afterFailure.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,
      `Ic0:${WS_2}:completed:1`,

      // Ic1 failed globally + workspace rows
      'Ic1:instance:failed:1',
      `Ic1:${WS_1}:failed:1`,
      `Ic1:${WS_2}:failed:1`,
    ]);

    // WS_3 created while Ic1 is failed —
    // getInitialCursorForNewWorkspace returns { name: 'Ic1', status: 'failed' }
    await seedWorkspaceMigration(context.dataSource, {
      name: 'Ic1',
      status: 'failed',
      workspaceId: WS_3,
      isInitial: true,
      useCurrentTimestamp: true,
    });

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3]);

    // Second run — Ic1 retries and succeeds, then WC segment runs for all 3
    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2, WS_3],
      },
    });

    expect(report.totalFailures).toBe(0);

    const afterRetry = await testGetExecutedMigrationsInOrder(
      context.dataSource,
    );

    expect(afterRetry.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Ic0:${WS_1}:completed:1`,
      `Ic0:${WS_2}:completed:1`,

      // First run — Ic1 failed
      'Ic1:instance:failed:1',
      `Ic1:${WS_1}:failed:1`,
      `Ic1:${WS_2}:failed:1`,

      // WS_3 created after Ic1 failure, initial cursor at Ic1:failed
      `Ic1:${WS_3}:failed:1:initial`,

      // Second run — Ic1 retry succeeds
      'Ic1:instance:completed:2',
      `Ic1:${WS_1}:completed:2`,
      `Ic1:${WS_2}:completed:2`,
      `Ic1:${WS_3}:completed:2`,

      // WC segment runs for all 3 workspaces
      `Wc0:${WS_1}:completed:1`,
      `Wc1:${WS_1}:completed:1`,
      `Wc0:${WS_2}:completed:1`,
      `Wc1:${WS_2}:completed:1`,
      `Wc0:${WS_3}:completed:1`,
      `Wc1:${WS_3}:completed:1`,
    ]);
  });

});
