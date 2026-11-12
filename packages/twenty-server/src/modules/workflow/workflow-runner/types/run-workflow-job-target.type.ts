import {
  type QueueJobScope,
  type QueueJobSettings,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export type RunWorkflowJobTarget = QueueJobScope &
  Pick<QueueJobSettings, 'limiter'>;
