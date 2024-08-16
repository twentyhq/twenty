import { Module } from '@nestjs/common';

import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';

@Module({
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
