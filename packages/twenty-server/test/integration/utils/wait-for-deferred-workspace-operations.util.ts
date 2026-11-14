import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 250;

// record access groups are computed by deferred operations, which outlive the job that queued them
export const waitForDeferredWorkspaceOperations = async (
  workspaceId: string,
): Promise<void> => {
  const startedAt = Date.now();

  while (true) {
    await waitForAllJobsToFinish();

    const unfinishedOperations: { name: string; lastError: string | null }[] =
      await globalThis.testDataSource.query(
        `SELECT name, "lastError" FROM core."deferredWorkspaceOperation" WHERE "workspaceId" = $1 AND status <> 'COMPLETED'`,
        [workspaceId],
      );

    if (unfinishedOperations.length === 0) {
      return;
    }

    if (Date.now() - startedAt > TIMEOUT_MS) {
      throw new Error(
        `Deferred workspace operations still unfinished after ${TIMEOUT_MS}ms: ${JSON.stringify(unfinishedOperations)}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
};
