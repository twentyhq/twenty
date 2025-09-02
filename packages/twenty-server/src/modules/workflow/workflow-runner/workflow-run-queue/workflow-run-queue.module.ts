import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowHandleStaledRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/command/workflow-handle-staled-runs.command';
import { WorkflowRunEnqueueCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/command/workflow-run-enqueue.command';
import { WorkflowCleanWorkflowRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
import { WorkflowHandleStaledRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-handle-staled-runs.cron.command';
import { WorkflowRunEnqueueCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-run-enqueue.cron.command';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-clean-workflow-runs.cron.job';
import { WorkflowHandleStaledRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs.cron.job';
import { WorkflowRunEnqueueJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue.cron.job';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

@Module({
  imports: [
    CacheStorageModule,
    TypeOrmModule.forFeature([Workspace]),
    MessageQueueModule,
    WorkspaceDataSourceModule,
    MetricsModule,
  ],
  providers: [
    WorkflowRunQueueWorkspaceService,
    WorkflowRunEnqueueWorkspaceService,
    WorkflowRunEnqueueCronCommand,
    WorkflowRunEnqueueCommand,
    WorkflowRunEnqueueJob,
    WorkflowHandleStaledRunsWorkspaceService,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsCommand,
    WorkflowHandleStaledRunsJob,
    WorkflowCleanWorkflowRunsJob,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
  exports: [
    WorkflowRunQueueWorkspaceService,
    WorkflowRunEnqueueCronCommand,
    WorkflowRunEnqueueCommand,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsCommand,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
})
export class WorkflowRunQueueModule {}
