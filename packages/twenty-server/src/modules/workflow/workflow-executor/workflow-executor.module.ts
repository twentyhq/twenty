import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionExecutorModule } from 'src/modules/workflow/workflow-action-executor/workflow-action-executor.module';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-executor.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowActionExecutorModule],
  providers: [WorkflowExecutorWorkspaceService],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
