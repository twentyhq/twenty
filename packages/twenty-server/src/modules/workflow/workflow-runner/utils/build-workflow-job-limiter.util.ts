import { type QueueJobLimiter } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';
import { buildQueueJobLimiter } from 'src/engine/core-modules/message-queue/utils/build-queue-job-limiter.util';

// jobConfig is undefined until the 2.58 instance command has added the column.
export const buildWorkflowJobLimiter = ({
  coreWorkflowId,
  limiter,
}: {
  coreWorkflowId: string;
  limiter: MessageQueueLimiter | null | undefined;
}): QueueJobLimiter | undefined =>
  buildQueueJobLimiter({ key: `workflow:${coreWorkflowId}`, limiter });
