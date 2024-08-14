import { Module } from '@nestjs/common';

import { WorkflowStatusWorkspaceService } from 'src/modules/workflow/workflow-status/workflow-status.workspace-service';

@Module({
  providers: [WorkflowStatusWorkspaceService],
  exports: [WorkflowStatusWorkspaceService],
})
export class WorkflowStatusModule {}
