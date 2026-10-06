import { Module } from '@nestjs/common';

import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';
import { WorkflowWaitModule } from 'src/modules/workflow/workflow-wait/workflow-wait.module';

@Module({
  imports: [WorkflowTriggerModule, WorkflowWaitModule, WorkflowToolsModule],
})
export class WorkflowModule {}
