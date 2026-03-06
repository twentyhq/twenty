import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_CRON_TRIGGER_CRON_PATTERN,
  WorkflowCronTriggerCronJob,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/workflow-cron-trigger-cron.job';

@Command({
  name: 'cron:workflow:automated-cron-trigger',
  description: 'Starts a cron job to trigger cron triggered workflows',
})
export class WorkflowCronTriggerCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WorkflowCronTriggerCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_CRON_TRIGGER_CRON_PATTERN,
        },
      },
    });
  }
}
