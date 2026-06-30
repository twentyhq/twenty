import { Module } from '@nestjs/common';

import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [LogicFunctionModule, WorkflowRunModule],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
