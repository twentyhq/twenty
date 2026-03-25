import { Module } from '@nestjs/common';

import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';

@Module({
  imports: [LogicFunctionModule],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
