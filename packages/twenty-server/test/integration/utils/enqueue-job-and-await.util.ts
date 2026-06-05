import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

export const enqueueJobAndAwait = async <
  TData extends MessageQueueJobData,
  TResult,
>(
  queue: MessageQueue,
  job: { name: string },
  data: TData,
): Promise<TResult> => {
  const messageQueueService = global.app.get<MessageQueueService>(
    getQueueToken(queue),
    { strict: false },
  );

  return (await messageQueueService.add<TData, TResult>(
    job.name,
    data,
  )) as TResult;
};
