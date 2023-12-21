import { ModuleRef } from '@nestjs/core';

import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { getJobClassName } from 'src/integrations/message-queue/utils/get-job-class-name.util';

export class SyncDriver implements MessageQueueDriver {
  constructor(private readonly jobsModuleRef: ModuleRef) {}

  async add<T extends MessageQueueJobData>(
    _queueName: MessageQueue,
    jobName: string,
    data: T,
    _options?: QueueJobOptions | undefined,
  ): Promise<void> {
    const jobClassName = getJobClassName(jobName);
    const job: MessageQueueJob<MessageQueueJobData> = this.jobsModuleRef.get(
      jobClassName,
      { strict: true },
    );

    return await job.handle(data);
  }

  work<T>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => void | Promise<void>,
  ) {
    return;
  }
}
