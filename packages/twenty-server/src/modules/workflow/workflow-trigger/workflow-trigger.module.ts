import { Module } from '@nestjs/common';

import { WorkflowTriggerJobModule } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger-job.module';
import { WorkflowTriggerListenerModule } from 'src/modules/workflow/workflow-trigger/listeners/workflow-trigger-listener.module';

@Module({
  imports: [WorkflowTriggerJobModule, WorkflowTriggerListenerModule],
})
export class WorkflowTriggerModule {}
