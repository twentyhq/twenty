import { Module } from '@nestjs/common';

import { WorkflowCoreSyncModule } from 'src/modules/workflow/workflow-core-sync/workflow-core-sync.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';
import { WorkflowWaitModule } from 'src/modules/workflow/workflow-wait/workflow-wait.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowStatusModule,
    WorkflowCoreSyncModule,
    WorkflowWaitModule,
    WorkflowToolsModule,
  ],
})
export class WorkflowModule {}
