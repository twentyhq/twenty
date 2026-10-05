import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_STEP_WAIT_SWEEP_CRON_PATTERN,
  WorkflowStepWaitSweepCronJob,
} from 'src/modules/workflow/workflow-wait/crons/jobs/workflow-step-wait-sweep.cron.job';

@Command({
  name: 'cron:workflow:step-wait-sweep',
  description: 'Reschedules workflow step waits whose resume time passed',
})
export class WorkflowStepWaitSweepCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: WorkflowStepWaitSweepCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_STEP_WAIT_SWEEP_CRON_PATTERN,
        },
      },
    });
  }
}
