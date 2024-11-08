import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowActionsModule } from 'src/modules/workflow/workflow-executor/workflow-actions/workflow-actions.module';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowActionsModule],
  providers: [
    WorkflowExecutorWorkspaceService,
    ScopedWorkspaceContextFactory,
    WorkflowActionFactory,
  ],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
