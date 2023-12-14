import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueues } from 'src/integrations/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T>(
    queueName: MessageQueues,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void>;
  work<T>(
    queueName: MessageQueues,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
  );
  stop?(): Promise<void>;
  register?(queueName: MessageQueues): void;
}
