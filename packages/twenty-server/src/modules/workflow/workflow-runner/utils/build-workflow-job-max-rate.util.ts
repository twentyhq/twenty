import { type QueueJobMaxRate } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-max-rate.type';
import { buildQueueJobMaxRate } from 'src/engine/core-modules/message-queue/utils/build-queue-job-max-rate.util';

// maxRate is undefined until the 2.58 instance command has added the column.
export const buildWorkflowJobMaxRate = ({
  coreWorkflowId,
  maxRate,
}: {
  coreWorkflowId: string;
  maxRate: MessageQueueMaxRate | null | undefined;
}): QueueJobMaxRate | undefined =>
  buildQueueJobMaxRate({ key: `workflow:${coreWorkflowId}`, maxRate });
