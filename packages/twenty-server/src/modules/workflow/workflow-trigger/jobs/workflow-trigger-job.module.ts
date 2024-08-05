import { Module } from '@nestjs/common';

import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';

@Module({
  imports: [WorkflowRunnerModule],
  providers: [WorkflowEventTriggerJob],
})
export class WorkflowTriggerJobModule {}
