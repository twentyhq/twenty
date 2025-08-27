import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowCleanWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
import { WorkflowHandleStaledRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-handle-staled-runs.cron.command';
import { WorkflowRunEnqueueCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-run-enqueue.cron.command';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-clean-workflow-runs.cron.job';
import { WorkflowHandleStaledRunsPerWorkspaceJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs-per-workspace.job';
import { WorkflowHandleStaledRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs.job';
import { WorkflowRunEnqueuePerWorkspaceJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue-per-workspace.job';
import { WorkflowRunEnqueueJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue.job';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

@Module({
  imports: [
    CacheStorageModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    MessageQueueModule,
    WorkspaceDataSourceModule,
    MetricsModule,
  ],
  providers: [
    WorkflowRunQueueWorkspaceService,
    WorkflowRunEnqueueCronCommand,
    WorkflowRunEnqueueJob,
    WorkflowRunEnqueuePerWorkspaceJob,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsJob,
    WorkflowHandleStaledRunsPerWorkspaceJob,
    WorkflowCleanWorkflowRunsJob,
    WorkflowCleanWorkflowRunsCommand,
  ],
  exports: [
    WorkflowRunQueueWorkspaceService,
    WorkflowRunEnqueueCronCommand,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowCleanWorkflowRunsCommand,
  ],
})
export class WorkflowRunQueueModule {}
