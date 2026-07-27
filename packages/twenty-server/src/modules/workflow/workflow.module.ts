import { Module } from '@nestjs/common';

import { WorkflowCoreSyncModule } from 'src/modules/workflow/workflow-core-sync/workflow-core-sync.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowVersionCoreSyncModule } from 'src/modules/workflow/workflow-version-core-sync/workflow-version-core-sync.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowStatusModule,
    WorkflowVersionCoreSyncModule,
    WorkflowCoreSyncModule,
  ],
})
export class WorkflowModule {}
