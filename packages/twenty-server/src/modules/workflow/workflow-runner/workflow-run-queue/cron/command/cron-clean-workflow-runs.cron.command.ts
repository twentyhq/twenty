import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CLEAN_WORKFLOW_RUN_CRON_PATTERN,
  CleanWorkflowRunsJob,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/clean-workflow-runs.cron.job';

@Command({
  name: 'cron:workflow:clean-workflow-runs',
  description: 'Clean workflow runs',
})
export class CronCleanWorkflowRunsCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: CleanWorkflowRunsJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CLEAN_WORKFLOW_RUN_CRON_PATTERN,
        },
      },
    });
  }
}
