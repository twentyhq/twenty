import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 250;

// record access groups are computed by deferred operations, which run for longer than the job queue is expected to stay busy
export const waitForDeferredWorkspaceOperations = async (
  workspaceId: string,
  timeoutMs: number = TIMEOUT_MS,
): Promise<void> => {
  const startedAt = Date.now();
  const findUnfinishedOperations = (): Promise<
    { name: string; status: string; lastError: string | null }[]
  > =>
    globalThis.testDataSource.query(
      `SELECT name, status, "lastError" FROM core."deferredWorkspaceOperation" WHERE "workspaceId" = $1`,
      [workspaceId],
    );

  await waitForAllJobsToFinish().catch(() => undefined);

  let unfinishedOperations = await findUnfinishedOperations();

  while (unfinishedOperations.length > 0) {
    if (
      Date.now() - startedAt > timeoutMs ||
      unfinishedOperations.some(({ status }) => status === 'FAILED')
    ) {
      throw new Error(
        `Deferred workspace operations did not finish: ${JSON.stringify(unfinishedOperations)}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    unfinishedOperations = await findUnfinishedOperations();
  }

  await waitForAllJobsToFinish();
};
