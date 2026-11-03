import { Module } from '@nestjs/common';

import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';

@Module({
  providers: [WorkflowDeletionCleanupWorkspaceService],
  exports: [WorkflowDeletionCleanupWorkspaceService],
})
export class WorkflowDeletionModule {}
