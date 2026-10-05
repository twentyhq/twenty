import { Module } from '@nestjs/common';

import { WorkflowCoreSyncModule } from 'src/modules/workflow/workflow-core-sync/workflow-core-sync.module';
import { WorkflowDeletionModule } from 'src/modules/workflow/workflow-deletion/workflow-deletion.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowWaitModule } from 'src/modules/workflow/workflow-wait/workflow-wait.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowStatusModule,
    WorkflowCoreSyncModule,
    WorkflowDeletionModule,
    WorkflowWaitModule,
  ],
})
export class WorkflowModule {}
