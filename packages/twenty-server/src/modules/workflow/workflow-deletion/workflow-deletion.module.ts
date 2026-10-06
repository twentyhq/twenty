import { Module } from '@nestjs/common';

import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';
import { WorkflowThrottlingModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-throttling.module';

@Module({
  imports: [WorkflowThrottlingModule],
  providers: [WorkflowDeletionCleanupWorkspaceService],
  exports: [WorkflowDeletionCleanupWorkspaceService],
})
export class WorkflowDeletionModule {}
