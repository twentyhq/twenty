import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  imports: [WorkflowCommonModule],
  providers: [WorkflowRunWorkspaceService],
  exports: [WorkflowRunWorkspaceService],
})
export class WorkflowRunModule {}
