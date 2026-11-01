import { Module } from '@nestjs/common';

import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

@Module({
  imports: [WorkflowTriggerModule, WorkflowToolsModule],
})
export class WorkflowModule {}
