import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-run.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowExecutorModule],
  providers: [
    WorkflowRunnerWorkspaceService,
    WorkflowRunWorkspaceService,
    RunWorkflowJob,
  ],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
