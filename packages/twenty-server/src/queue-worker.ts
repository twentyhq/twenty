import { NestFactory } from '@nestjs/core';

import { jobHandlers } from 'src/integrations/message-queue/job-handlers';
import { MessageQueues } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { QueueWorkerModule } from 'src/queue-worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(QueueWorkerModule);

  for (const queueName of Object.values(MessageQueues)) {
    const messageQueueService: MessageQueueService = app.get(queueName);

    await messageQueueService.work(jobHandler);
  }
}
bootstrap();

function getJobName(name: string): string {
  const [, jobName] = name.split('.') ?? [];

  return jobName ?? name;
}

async function jobHandler(job) {
  const jobName = getJobName(job.name);

  if (jobHandlers[jobName]) {
    await jobHandlers[jobName].handle(job.data);
  } else {
    console.error(`No handler found for job: ${jobName}`);
  }
}
