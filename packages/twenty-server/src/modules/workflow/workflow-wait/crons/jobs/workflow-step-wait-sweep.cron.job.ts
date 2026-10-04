import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

export const WORKFLOW_STEP_WAIT_SWEEP_CRON_PATTERN = '*/5 * * * *';

const OVERDUE_GRACE_INTERVAL = '5 minutes';
const OVERDUE_WAITS_BATCH_SIZE = 1000;

type OverdueWaitRow = {
  id: string;
  workspaceId: string;
  workflowRunId: string;
};

// Resolutions are queued jobs, so a lost job would leave its wait forever; claiming makes a duplicate harmless
@Processor(MessageQueue.cronQueue)
export class WorkflowStepWaitSweepCronJob {
  private readonly logger = new Logger(WorkflowStepWaitSweepCronJob.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
  ) {}

  @Process(WorkflowStepWaitSweepCronJob.name)
  @SentryCronMonitor(
    WorkflowStepWaitSweepCronJob.name,
    WORKFLOW_STEP_WAIT_SWEEP_CRON_PATTERN,
  )
  async handle() {
    const overdueWaits: OverdueWaitRow[] = await this.coreDataSource.query(
      `SELECT "id", "workspaceId", "workflowRunId" FROM "core"."workflowStepWait"
       WHERE "resumeAt" < now() - interval '${OVERDUE_GRACE_INTERVAL}'
       ORDER BY "resumeAt" ASC
       LIMIT $1`,
      [OVERDUE_WAITS_BATCH_SIZE],
    );

    for (const { id, workspaceId, workflowRunId } of overdueWaits) {
      await this.workflowStepWaitWorkspaceService.scheduleOverdueResolution({
        workspaceId,
        workflowRunId,
        waitId: id,
      });
    }

    if (overdueWaits.length > 0) {
      this.logger.log(`Rescheduled ${overdueWaits.length} overdue step waits`);
    }
  }
}
