import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueues } from 'src/integrations/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T>(
    queueName: MessageQueues,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void>;
  work<T>(
    queueName: string,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
  );
  stop?(): Promise<void>;
  register?(queueName: MessageQueues): void;
}
