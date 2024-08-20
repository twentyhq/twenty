import { Module } from '@nestjs/common';

import { WorkflowTriggerJobModule } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger-job.module';
import { WorkflowTriggerListenerModule } from 'src/modules/workflow/workflow-trigger/listeners/workflow-trigger-listener.module';
import { WorkflowTriggerServiceModule } from 'src/modules/workflow/workflow-trigger/services/workflow-trigger-service.module';

@Module({
  imports: [
    WorkflowTriggerJobModule,
    WorkflowTriggerListenerModule,
    WorkflowTriggerServiceModule,
  ],
})
export class WorkflowTriggerModule {}
