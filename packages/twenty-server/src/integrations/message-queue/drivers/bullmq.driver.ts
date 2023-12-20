import { Queue, QueueOptions, Worker } from 'bullmq';

import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';

import { MessageQueueDriver } from './interfaces/message-queue-driver.interface';

export type BullMQDriverOptions = QueueOptions;

export class BullMQDriver implements MessageQueueDriver {
  private queueMap: Record<MessageQueue, Queue> = {} as Record<
    MessageQueue,
    Queue
  >;
  private workerMap: Record<MessageQueue, Worker> = {} as Record<
    MessageQueue,
    Worker
  >;

  constructor(private options: BullMQDriverOptions) {}

  register(queueName: MessageQueue): void {
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
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void>,
  ) {
    const worker = new Worker(
      queueName,
      async (job) => {
        await handler(job as { data: T; id: string });
      },
      this.options,
    );

    this.workerMap[queueName] = worker;
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }
    await this.queueMap[queueName].add(jobName, data, {
      jobId: options?.id,
      priority: options?.priority,
    });
  }
}
