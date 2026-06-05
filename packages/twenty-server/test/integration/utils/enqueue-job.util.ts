import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

export const enqueueJob = async <TData extends MessageQueueJobData>(
  queue: MessageQueue,
  job: { name: string },
  data: TData,
): Promise<void> => {
  const messageQueueService = global.app.get<MessageQueueService>(
    getQueueToken(queue),
    { strict: false },
  );

  await messageQueueService.add(job.name, data);
};
