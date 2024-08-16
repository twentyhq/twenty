import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowActionRunnerFactory } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.factory';
import { CodeWorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runners/code-workflow-action-runner';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [
    WorkflowActionRunnerFactory,
    CodeWorkflowActionRunner,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowActionRunnerFactory],
})
export class WorkflowActionRunnerModule {}
