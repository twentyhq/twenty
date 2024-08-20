import { Module } from '@nestjs/common';

import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';
import { WorkflowTriggerServiceModule } from 'src/modules/workflow/workflow-trigger/services/workflow-trigger-service.module';

@Module({
  imports: [WorkflowTriggerServiceModule],
  providers: [WorkflowEventTriggerJob],
})
export class WorkflowTriggerJobModule {}
