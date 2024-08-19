import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionRunnerModule } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.module';
import { WorkflowRunnerJob } from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowActionRunnerModule,
    WorkflowStatusModule,
  ],
  providers: [WorkflowRunnerWorkspaceService, WorkflowRunnerJob],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
