import { Module } from '@nestjs/common';

import { ChargeModule } from 'src/modules/charges/charge.module';
import { TraceableModule } from 'src/modules/traceable/traceable.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowStatusModule,
    TraceableModule,
    ChargeModule,
  ],
})
export class WorkflowModule {}
