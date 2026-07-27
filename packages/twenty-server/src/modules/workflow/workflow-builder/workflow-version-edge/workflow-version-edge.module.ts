import { Module } from '@nestjs/common';

import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowVersionCoreModule],
  providers: [WorkflowVersionEdgeWorkspaceService],
  exports: [WorkflowVersionEdgeWorkspaceService],
})
export class WorkflowVersionEdgeModule {}
