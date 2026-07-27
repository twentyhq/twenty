import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_CORE_CONSISTENCY_CRON_PATTERN,
  WorkflowCoreConsistencyCronJob,
} from 'src/modules/workflow/workflow-core-consistency/crons/jobs/workflow-core-consistency-cron.job';

@Command({
  name: 'cron:workflow:core-consistency-check',
  description:
    'Starts a cron job that checks workflow, version and automated-trigger consistency between the workspace and core',
})
export class WorkflowCoreConsistencyCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WorkflowCoreConsistencyCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_CORE_CONSISTENCY_CRON_PATTERN,
        },
      },
    });
  }
}
