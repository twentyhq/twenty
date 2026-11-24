import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowHandleStaledRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/command/workflow-handle-staled-runs.command';
import { WorkflowCleanWorkflowRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
import { WorkflowHandleStaledRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-handle-staled-runs.cron.command';
import { WorkflowCleanWorkflowRunsCronJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-clean-workflow-runs.cron.job';
import { WorkflowHandleStaledRunsCronJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs.cron.job';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';
import { WorkflowHandleStaledRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-handle-staled-runs.job';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    MetricsModule,
    WorkflowRunModule,
  ],
  providers: [
    WorkflowHandleStaledRunsWorkspaceService,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsCommand,
    WorkflowHandleStaledRunsCronJob,
    WorkflowHandleStaledRunsJob,
    WorkflowCleanWorkflowRunsCronJob,
    WorkflowCleanWorkflowRunsJob,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
  exports: [
    WorkflowHandleStaledRunsCronCommand,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
})
export class WorkflowRunQueueModule {}
