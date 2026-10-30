import { Injectable } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SETU_AI_TASK_DISPATCHER_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-dispatcher-cron-pattern.constant';
import { SetuAiTaskDispatcherService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-dispatcher.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class SetuAiTaskDispatcherCronJob {
  constructor(
    private readonly dispatcherService: SetuAiTaskDispatcherService,
  ) {}

  @Process(SetuAiTaskDispatcherCronJob.name)
  @SentryCronMonitor(
    SetuAiTaskDispatcherCronJob.name,
    SETU_AI_TASK_DISPATCHER_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.dispatcherService.dispatch();
  }
}
