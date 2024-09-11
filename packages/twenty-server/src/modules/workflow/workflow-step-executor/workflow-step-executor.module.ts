import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowStepExecutorFactory } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.factory';
import { CodeWorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/factories/code.workflow-step-executor';
import { SendEmailWorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/factories/send-email.workflow-step-executor';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [
    WorkflowStepExecutorFactory,
    CodeWorkflowStepExecutor,
    SendEmailWorkflowStepExecutor,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowStepExecutorFactory],
})
export class WorkflowStepExecutorModule {}
