import { Module } from '@nestjs/common';

import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';

@Module({
  imports: [LogicFunctionExecutorModule],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
