import { Module } from '@nestjs/common';

import { ApplicationReachModule } from 'src/engine/core-modules/authorization/application-reach/application-reach.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { LogicFunctionWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/logic-function.workflow-action';

@Module({
  imports: [WorkflowExecutionContextModule, ApplicationReachModule],
  providers: [LogicFunctionWorkflowAction],
  exports: [LogicFunctionWorkflowAction],
})
export class LogicFunctionActionModule {}
