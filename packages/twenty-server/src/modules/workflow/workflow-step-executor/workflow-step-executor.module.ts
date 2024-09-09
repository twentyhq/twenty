import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowStepExecutorFactory } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.factory';
import { CodeActionExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executors/code-action-executor';
import { SystemActionExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executors/system-action-executor';
import { WorkflowSystemActionModule } from 'src/modules/workflow/workflow-system-action/workflow-system-action.module';

@Module({
  imports: [ServerlessFunctionModule, WorkflowSystemActionModule],
  providers: [
    WorkflowStepExecutorFactory,
    CodeActionExecutor,
    SystemActionExecutor,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowStepExecutorFactory],
})
export class WorkflowStepExecutorModule {}
