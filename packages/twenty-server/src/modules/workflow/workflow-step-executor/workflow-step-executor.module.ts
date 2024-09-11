import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowStepExecutorFactory } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.factory';
import { CodeActionExecutorFactory } from 'src/modules/workflow/workflow-step-executor/factories/code-action-executor.factory';
import { SendEmailActionExecutorFactory } from 'src/modules/workflow/workflow-step-executor/factories/send-email-action-executor.factory';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [
    WorkflowStepExecutorFactory,
    CodeActionExecutorFactory,
    SendEmailActionExecutorFactory,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowStepExecutorFactory],
})
export class WorkflowStepExecutorModule {}
