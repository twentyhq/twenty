import { Module } from '@nestjs/common';

import { WorkflowActionRunnerFactory } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.factory';
import { CodeWorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runners/code-workflow-action-runner';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [WorkflowActionRunnerFactory, CodeWorkflowActionRunner],
  exports: [WorkflowActionRunnerFactory],
})
export class WorkflowActionRunnerModule {}
