import { Module } from '@nestjs/common';

import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowStepPendingWakeUpHandlerWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-pending-wake-up-handler.workspace-service';

@Module({
  imports: [
    PendingWakeUpModule,
    WorkflowExecutorModule,
    WorkflowRunModule,
    WorkflowExecutionContextModule,
    RecordCrudModule,
  ],
  providers: [WorkflowStepPendingWakeUpHandlerWorkspaceService],
})
export class WorkflowWaitModule {}
