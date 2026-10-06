import { Module } from '@nestjs/common';

import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';
import { WorkflowThrottlingModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-throttling.module';
import { WorkflowStepWaitStoreModule } from 'src/modules/workflow/workflow-wait/workflow-step-wait-store.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkflowStepWaitStoreModule,
    WorkflowThrottlingModule,
  ],
  providers: [WorkflowDeletionCleanupWorkspaceService],
  exports: [WorkflowDeletionCleanupWorkspaceService],
})
export class WorkflowDeletionModule {}
