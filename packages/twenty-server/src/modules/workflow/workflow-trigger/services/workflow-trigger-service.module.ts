import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/services/workflow-trigger.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowStatusModule],
  providers: [WorkflowTriggerWorkspaceService, ScopedWorkspaceContextFactory],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerServiceModule {}
