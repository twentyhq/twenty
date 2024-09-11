import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-executor.workspace-service';
import { WorkflowStepExecutorFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-step-executor.factory';
import { CodeWorkflowStepExecutor } from 'src/modules/workflow/workflow-executor/factories/workflow-step-executors/code.workflow-step-executor';
import { SendEmailWorkflowStepExecutor } from 'src/modules/workflow/workflow-executor/factories/workflow-step-executors/send-email.workflow-step-executor';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

@Module({
  imports: [WorkflowCommonModule, ServerlessFunctionModule],
  providers: [
    WorkflowExecutorWorkspaceService,
    ScopedWorkspaceContextFactory,
    WorkflowStepExecutorFactory,
    CodeWorkflowStepExecutor,
    SendEmailWorkflowStepExecutor,
  ],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
