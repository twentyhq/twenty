import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';

@Module({
  imports: [WorkflowCommonModule],
  providers: [WorkflowVersionEdgeWorkspaceService],
  exports: [WorkflowVersionEdgeWorkspaceService],
})
export class WorkflowVersionEdgeModule {}
