import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-executor.workspace-service';
import { WorkflowStepExecutorModule } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.module';

@Module({
  imports: [WorkflowCommonModule, WorkflowStepExecutorModule],
  providers: [WorkflowExecutorWorkspaceService],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
