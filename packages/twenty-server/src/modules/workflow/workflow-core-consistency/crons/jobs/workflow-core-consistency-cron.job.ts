import { Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowCoreConsistencyService } from 'src/modules/workflow/workflow-core-consistency/services/workflow-core-consistency.service';

export const WORKFLOW_CORE_CONSISTENCY_CRON_PATTERN = '0 */3 * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowCoreConsistencyCronJob {
  private readonly logger = new Logger(WorkflowCoreConsistencyCronJob.name);

  constructor(
    private readonly workflowCoreConsistencyService: WorkflowCoreConsistencyService,
  ) {}

  @Process(WorkflowCoreConsistencyCronJob.name)
  @SentryCronMonitor(
    WorkflowCoreConsistencyCronJob.name,
    WORKFLOW_CORE_CONSISTENCY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('WorkflowCoreConsistencyCronJob started');

    await this.workflowCoreConsistencyService.runConsistencyCheck();

    this.logger.log('WorkflowCoreConsistencyCronJob completed');
  }
}
