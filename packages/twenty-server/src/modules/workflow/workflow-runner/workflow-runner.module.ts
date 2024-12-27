import { Module } from '@nestjs/common';

import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowExecutorModule, ThrottlerModule],
  providers: [
    WorkflowRunnerWorkspaceService,
    WorkflowRunWorkspaceService,
    RunWorkflowJob,
  ],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
