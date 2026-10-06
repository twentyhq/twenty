import { Module } from '@nestjs/common';

import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowStepPendingWakeUpHandlerWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-pending-wake-up-handler.workspace-service';

@Module({
  imports: [
    PendingWakeUpModule,
    WorkflowRunModule,
    WorkflowExecutionContextModule,
  ],
  providers: [WorkflowStepPendingWakeUpHandlerWorkspaceService],
})
export class WorkflowWaitModule {}
