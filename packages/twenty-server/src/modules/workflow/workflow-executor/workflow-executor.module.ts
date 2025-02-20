import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-actions/workflow-action-executor.module';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowRunModule,
    WorkflowActionExecutorModule,
  ],
  providers: [WorkflowExecutorWorkspaceService, ScopedWorkspaceContextFactory],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
