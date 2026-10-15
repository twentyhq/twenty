import { Module } from '@nestjs/common';

import { LogicFunctionModule as LogicFunctionMetadataModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    LogicFunctionMetadataModule,
    WorkflowRunModule,
    WorkspaceCacheModule,
  ],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
