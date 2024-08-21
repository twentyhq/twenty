import { Module } from '@nestjs/common';

import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';

@Module({
  imports: [WorkflowRunnerModule, WorkflowStatusModule],
  providers: [WorkflowEventTriggerJob],
})
export class WorkflowTriggerJobModule {}
