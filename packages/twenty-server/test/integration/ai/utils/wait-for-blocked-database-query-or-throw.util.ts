import { fail } from 'node:assert';

const DATABASE_WAITER_TIMEOUT_MS = 5_000;
const DATABASE_WAITER_POLL_INTERVAL_MS = 20;

export const waitForBlockedDatabaseQueryOrThrow = async (
  blockingProcessId: number,
) => {
  const deadline = Date.now() + DATABASE_WAITER_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const [{ isBlocked }]: { isBlocked: boolean }[] =
      await global.testDataSource.query(
        'SELECT EXISTS (SELECT FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))) AS "isBlocked"',
        [blockingProcessId],
      );

    if (isBlocked) {
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, DATABASE_WAITER_POLL_INTERVAL_MS),
    );
  }

  fail('The competing conversation creation did not wait for its ID');
};
