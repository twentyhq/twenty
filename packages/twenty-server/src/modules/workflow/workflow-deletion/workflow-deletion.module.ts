import { Module } from '@nestjs/common';

import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { CleanUpDeletedWorkflowsJob } from 'src/modules/workflow/workflow-deletion/jobs/clean-up-deleted-workflows.job';
import { WorkflowDeletionListener } from 'src/modules/workflow/workflow-deletion/listeners/workflow-deletion.listener';
import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { WorkflowStepWaitStoreModule } from 'src/modules/workflow/workflow-wait/workflow-step-wait-store.module';

@Module({
  imports: [
    WorkflowVersionCoreModule,
    WorkflowStepWaitStoreModule,
    WorkflowRunQueueModule,
  ],
  providers: [
    WorkflowDeletionCleanupWorkspaceService,
    WorkflowDeletionListener,
    CleanUpDeletedWorkflowsJob,
  ],
})
export class WorkflowDeletionModule {}
