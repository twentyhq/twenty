import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  WorkflowHandleStaledRunsJob,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs.cron.job';

@Command({
  name: 'cron:workflow:handle-staled-runs',
  description: 'Handles staled workflow runs',
})
export class WorkflowHandleStaledRunsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: WorkflowHandleStaledRunsJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
        },
      },
    });
  }
}
