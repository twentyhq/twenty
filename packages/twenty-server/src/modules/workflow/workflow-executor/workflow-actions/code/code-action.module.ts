import { Module } from '@nestjs/common';

import { LogicFunctionModule as LogicFunctionMetadataModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    LogicFunctionMetadataModule,
    WorkflowRunModule,
  ],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
