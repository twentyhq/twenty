import { NestFactory } from '@nestjs/core';

import {
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { JobsModule } from 'src/integrations/message-queue/jobs.module';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { getJobClassName } from 'src/integrations/message-queue/utils/get-job-class-name.util';
import { QueueWorkerModule } from 'src/queue-worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(QueueWorkerModule);

  for (const queueName of Object.values(MessageQueue)) {
    const messageQueueService: MessageQueueService = app.get(queueName);

    await messageQueueService.work(async (jobData: MessageQueueJobData) => {
      const jobClassName = getJobClassName(jobData.name);
      const job: MessageQueueJob<MessageQueueJobData> = app
        .select(JobsModule)
        .get(jobClassName, { strict: true });

      await job.handle(jobData.data);
    });
  }
}
bootstrap();
