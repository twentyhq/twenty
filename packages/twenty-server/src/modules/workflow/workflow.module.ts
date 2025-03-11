import { Module } from '@nestjs/common';

import { TraceableModule } from 'src/modules/traceable/traceable.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [WorkflowTriggerModule, WorkflowStatusModule, TraceableModule],
})
export class WorkflowModule {}
