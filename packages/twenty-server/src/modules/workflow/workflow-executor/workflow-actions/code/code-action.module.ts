import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { LogicFunctionModule as LogicFunctionMetadataModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { CodeStepRunnerService } from 'src/modules/workflow/workflow-executor/workflow-actions/code/services/code-step-runner.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    CacheLockModule,
    WorkflowExecutionContextModule,
    LogicFunctionMetadataModule,
    WorkflowRunModule,
  ],
  providers: [CodeWorkflowAction, CodeStepRunnerService],
  exports: [CodeWorkflowAction, CodeStepRunnerService],
})
export class CodeActionModule {}
