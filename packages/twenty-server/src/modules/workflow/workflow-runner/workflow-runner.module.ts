import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';

@Module({
  imports: [WorkflowRunModule, WorkflowCommonModule, WorkflowExecutorModule],
  providers: [WorkflowRunnerWorkspaceService, RunWorkflowJob],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
