import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_RUN_DEQUEUE_CRON_PATTERN,
  WorkflowRunDequeueJob,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-dequeue.cron.job';

@Command({
  name: 'cron:workflow:dequeue-old-workflow-runs',
  description: 'Dequeues old workflow runs',
})
export class CronWorkflowRunDequeueCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: WorkflowRunDequeueJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_RUN_DEQUEUE_CRON_PATTERN,
        },
      },
    });
  }
}
