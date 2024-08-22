import { Module } from '@nestjs/common';

import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  providers: [WorkflowRunWorkspaceService],
  exports: [WorkflowRunWorkspaceService],
})
export class WorkflowRunModule {}
