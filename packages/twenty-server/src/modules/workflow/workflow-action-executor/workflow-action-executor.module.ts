import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowActionExecutorFactory } from 'src/modules/workflow/workflow-action-executor/workflow-action-executor.factory';
import { CodeWorkflowActionExecutor } from 'src/modules/workflow/workflow-action-executor/workflow-action-executors/code-workflow-action-executor';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [
    WorkflowActionExecutorFactory,
    CodeWorkflowActionExecutor,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowActionExecutorFactory],
})
export class WorkflowActionExecutorModule {}
