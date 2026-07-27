import { Module } from '@nestjs/common';

import { WorkflowCoreSyncModule } from 'src/modules/workflow/workflow-core-sync/workflow-core-sync.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowStatusModule,
    WorkflowCoreSyncModule,
  ],
})
export class WorkflowModule {}
