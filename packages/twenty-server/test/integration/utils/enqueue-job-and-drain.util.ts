import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

// Enqueues on the real BullMQ queue and waits for every queue to drain, so
// follow-up jobs the worker chains (imports, contact creation, ...) are also
// done when this resolves. Failure-path suites rely on the job being allowed
// to fail: they assert the resulting channel state afterwards.
export const enqueueJobAndDrain = async <TData extends MessageQueueJobData>(
  queue: MessageQueue,
  jobName: string,
  data: TData,
): Promise<void> => {
  const messageQueueService = global.app.get<MessageQueueService>(
    getQueueToken(queue),
    { strict: false },
  );

  await messageQueueService.add(jobName, data);
  await waitForAllJobsToFinish();
};
