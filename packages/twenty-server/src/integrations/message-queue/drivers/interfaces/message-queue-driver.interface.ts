import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueJobData } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void>;
  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
  );
  stop?(): Promise<void>;
  register?(queueName: MessageQueue): void;
}
