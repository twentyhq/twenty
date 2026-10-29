import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';

export const runSyncCron = async (cronJob: { name: string }): Promise<void> => {
  await enqueueJobAndDrain({
    queue: MessageQueue.cronQueue,
    jobName: cronJob.name,
    data: {},
    scope: {
      isSystemJob: true,
    },
  });
};
