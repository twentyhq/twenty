import { Module } from '@nestjs/common';

import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';

@Module({
  providers: [WorkflowVersionEdgeWorkspaceService],
  exports: [WorkflowVersionEdgeWorkspaceService],
})
export class WorkflowVersionEdgeModule {}
