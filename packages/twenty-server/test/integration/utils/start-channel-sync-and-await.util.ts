import { startChannelSync } from 'test/integration/utils/query-messaging.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const startChannelSyncAndAwait = async (
  connectedAccountId: string,
): Promise<void> => {
  await startChannelSync(connectedAccountId);
  await waitForAllJobsToFinish();
};
