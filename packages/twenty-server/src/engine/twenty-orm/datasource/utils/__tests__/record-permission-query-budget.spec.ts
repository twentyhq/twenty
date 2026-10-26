import { Pool } from 'pg';

import { runWithRecordPermissionBudget } from 'src/engine/twenty-orm/datasource/utils/run-with-record-permission-budget.util';
import { TwentyOrmExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const connectionString = process.env.RECORD_PERMISSION_TEST_DATABASE_URL;
const describeDatabase = connectionString ? describe : describe.skip;

describeDatabase('Record query resource isolation', () => {
  jest.useRealTimers();
  const pool = new Pool({ connectionString, max: 8 });

  afterAll(() => pool.end());

  it('cancels work in PostgreSQL and returns a reusable connection', async () => {
    const startedAt = Date.now();

    await expect(
      runWithRecordPermissionBudget({
        pool,
        workspaceId: 'timeout-test',
        work: (client) => client.query('SELECT pg_sleep(4)'),
      }),
    ).rejects.toMatchObject({
      code: TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
    });
    expect(Date.now() - startedAt).toBeLessThan(1500);
    expect((await pool.query('SELECT 42 AS answer')).rows).toEqual([
      { answer: 42 },
    ]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS count FROM pg_stat_activity WHERE query = 'SELECT pg_sleep(4)' AND state = 'active'",
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it('rejects a saturated tenant without blocking another tenant', async () => {
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    let admitted = 0;
    let ready: () => void = () => undefined;
    const allAdmitted = new Promise<void>((resolve) => {
      ready = resolve;
    });
    const occupying = Array.from({ length: 4 }, () =>
      runWithRecordPermissionBudget({
        pool,
        workspaceId: 'saturated-test',
        work: async () => {
          if (++admitted === 4) ready();
          await released;
        },
      }),
    );

    try {
      await allAdmitted;
      await expect(
        runWithRecordPermissionBudget({
          pool,
          workspaceId: 'saturated-test',
          work: (client) => client.query('SELECT 1'),
        }),
      ).rejects.toMatchObject({
        code: TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
      });
      const other = await runWithRecordPermissionBudget({
        pool,
        workspaceId: 'other-tenant-test',
        work: (client) => client.query('SELECT 42 AS answer'),
      });
      expect(other.rows).toEqual([{ answer: 42 }]);
    } finally {
      release();
      await Promise.all(occupying);
    }
    await expect(
      runWithRecordPermissionBudget({
        pool,
        workspaceId: 'saturated-test',
        work: (client) => client.query('SELECT 1'),
      }),
    ).resolves.toBeDefined();
  });

  it('absorbs a short burst of nested reads without rejecting normal UI fan-out', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        runWithRecordPermissionBudget({
          pool,
          workspaceId: 'nested-ui-test',
          work: (client) => client.query('SELECT pg_sleep(0.02), 42 AS answer'),
        }),
      ),
    );
    expect(results).toHaveLength(12);
    expect(results.every((result) => result.rows[0].answer === 42)).toBe(true);
  });

  it('bounds pool checkout and releases a connection delivered after the deadline', async () => {
    const singleConnectionPool = new Pool({ connectionString, max: 1 });
    const occupied = await singleConnectionPool.connect();
    const work = jest.fn();
    const startedAt = Date.now();
    try {
      await expect(
        runWithRecordPermissionBudget({
          pool: singleConnectionPool,
          workspaceId: 'pool-wait-test',
          work,
        }),
      ).rejects.toMatchObject({
        code: TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
      });
      expect(Date.now() - startedAt).toBeLessThan(1000);
      expect(work).not.toHaveBeenCalled();
    } finally {
      occupied.release();
    }
    expect(
      (await singleConnectionPool.query('SELECT 42 AS answer')).rows,
    ).toEqual([{ answer: 42 }]);
    await singleConnectionPool.end();
  });

  it('rolls back preceding writes when a later statement exceeds its budget', async () => {
    await expect(
      runWithRecordPermissionBudget({
        pool,
        workspaceId: 'rollback-test',
        work: async (client) => {
          await client.query(
            'CREATE TEMP TABLE permission_budget_transaction (id int) ON COMMIT DROP',
          );
          await client.query(
            'INSERT INTO permission_budget_transaction VALUES (1)',
          );
          await client.query('SELECT pg_sleep(4)');
        },
      }),
    ).rejects.toMatchObject({
      code: TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
    });
    const remaining = await pool.query(
      "SELECT count(*)::int AS count FROM pg_tables WHERE tablename = 'permission_budget_transaction'",
    );
    expect(remaining.rows[0].count).toBe(0);
  });
});
