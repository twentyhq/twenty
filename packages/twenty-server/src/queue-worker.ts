import { NestFactory } from '@nestjs/core';

import {
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { LoggerService } from 'src/integrations/logger/logger.service';
import { MessageQueues } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { QueueWorkerModule } from 'src/queue-worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(QueueWorkerModule);

  const loggerService = app.get(LoggerService);

  loggerService.log('Starting queue worker', 'QueueWorker');

  for (const queueName of Object.values(MessageQueues)) {
    const messageQueueService: MessageQueueService = app.get(queueName);

    await messageQueueService.work(async (jobData: MessageQueueJobData) => {
      const jobClassName = getJobClassName(jobData.name);

      try {
        const job: MessageQueueJob<MessageQueueJobData> = app
          .select(QueueWorkerModule)
          .get(jobClassName, { strict: true });

        await job.handle(jobData.data);
      } catch (error) {
        loggerService.error(
          `No handler found for job: ${jobClassName} or job failed unexpectedly: ${error.message}}`,
          'QueueWorker',
        );
      }
    });
  }
}
bootstrap();

function getJobClassName(name: string): string {
  const [, jobName] = name.split('.') ?? [];

  return jobName ?? name;
}
