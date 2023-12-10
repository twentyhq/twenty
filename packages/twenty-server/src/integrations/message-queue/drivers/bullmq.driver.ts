import { Queue, QueueOptions, Worker } from 'bullmq';

import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueues } from 'src/integrations/message-queue/message-queue.constants';

import { MessageQueueDriver } from './interfaces/message-queue-driver.interface';

export type BullMQDriverOptions = QueueOptions;

export class BullMQDriver implements MessageQueueDriver {
  private queueMap: Record<MessageQueues, Queue> = {} as Record<
    MessageQueues,
    Queue
  >;
  private workerMap: Record<MessageQueues, Worker> = {} as Record<
    MessageQueues,
    Worker
  >;

  constructor(private options: BullMQDriverOptions) {}

  register(queueName: MessageQueues): void {
    this.queueMap[queueName] = new Queue(queueName, this.options);
  }

  async stop() {
    const workers = Object.values(this.workerMap);
    const queues = Object.values(this.queueMap);

    await Promise.all([
      ...queues.map((q) => q.close()),
      ...workers.map((w) => w.close()),
    ]);
  }

  async work<T>(
    queueName: MessageQueues,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void>,
  ) {
    const worker = new Worker(queueName, async (job) => {
      await handler(job as { data: T; id: string });
    });

    this.workerMap[queueName] = worker;
  }

  async add<T>(
    queueName: MessageQueues,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }
    await this.queueMap[queueName].add(options?.id || '', data, {
      priority: options?.priority,
    });
  }
}
