import { removeDelayedJobs } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';

export const removePendingWakeUpJobs = ({
  wakeUpIds,
}: {
  wakeUpIds: string[];
}) =>
  removeDelayedJobs({
    queueName: MessageQueue.delayedJobsQueue,
    shouldRemove: (job) =>
      job.name === RESUME_PENDING_WAKE_UP_JOB_NAME &&
      wakeUpIds.includes(job.data?.wakeUpId),
  });
