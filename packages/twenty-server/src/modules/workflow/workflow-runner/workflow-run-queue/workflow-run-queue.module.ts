import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CronWorkflowRunEnqueueCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/cron-workflow-run-enqueue.cron.command';
import { WorkflowRunEnqueueJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue.cron.job';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';
import { CleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/clean-workflow-runs.cron.job';
import { CronCleanWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/cron-clean-workflow-runs.cron.command';

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
    WorkflowRunEnqueueJob,
    CleanWorkflowRunsJob,
    CronWorkflowRunEnqueueCommand,
    CronCleanWorkflowRunsCommand,
  ],
  exports: [WorkflowRunQueueWorkspaceService],
})
export class WorkflowRunQueueModule {}
