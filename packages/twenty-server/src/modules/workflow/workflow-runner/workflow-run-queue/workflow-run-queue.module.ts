import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowHandleStaledRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/command/workflow-handle-staled-runs.command';
import { WorkflowCleanWorkflowRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
import { WorkflowHandleStaledRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-handle-staled-runs.cron.command';
import { WorkflowRunEnqueueCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-run-enqueue.cron.command';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-clean-workflow-runs.cron.job';
import { WorkflowHandleStaledRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-handle-staled-runs.cron.job';
import { WorkflowRunEnqueueCronJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue.cron.job';
import { WorkflowRunEnqueueJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-run-enqueue.job';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Module({
  imports: [
    CacheStorageModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    MessageQueueModule,
    WorkspaceDataSourceModule,
    MetricsModule,
    ThrottlerModule,
  ],
  providers: [
    WorkflowThrottlingWorkspaceService,
    WorkflowRunEnqueueCronJob,
    WorkflowRunEnqueueCronCommand,
    WorkflowRunEnqueueWorkspaceService,
    WorkflowRunEnqueueJob,
    WorkflowHandleStaledRunsWorkspaceService,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsCommand,
    WorkflowHandleStaledRunsJob,
    WorkflowCleanWorkflowRunsJob,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
  exports: [
    WorkflowThrottlingWorkspaceService,
    WorkflowRunEnqueueJob,
    WorkflowRunEnqueueCronJob,
    WorkflowRunEnqueueCronCommand,
    WorkflowHandleStaledRunsCronCommand,
    WorkflowHandleStaledRunsCommand,
    WorkflowCleanWorkflowRunsCronCommand,
  ],
})
export class WorkflowRunQueueModule {}
