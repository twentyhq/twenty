import { forwardRef, Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { RunWorkflowWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/run-workflow/run-workflow.workflow-action';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  // forwardRef breaks the WorkflowRunnerModule -> WorkflowExecutorModule ->
  // RunWorkflowActionModule -> WorkflowRunnerModule cycle (RunWorkflowWorkflowAction
  // needs WorkflowRunnerWorkspaceService, unlike every other action module).
  imports: [WorkflowCommonModule, forwardRef(() => WorkflowRunnerModule)],
  providers: [RunWorkflowWorkflowAction],
  exports: [RunWorkflowWorkflowAction],
})
export class RunWorkflowActionModule {}
