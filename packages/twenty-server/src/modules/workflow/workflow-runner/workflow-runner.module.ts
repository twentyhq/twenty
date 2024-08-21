import { Module } from '@nestjs/common';

import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';

@Module({
  imports: [WorkflowRunModule],
  providers: [WorkflowRunnerWorkspaceService],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
