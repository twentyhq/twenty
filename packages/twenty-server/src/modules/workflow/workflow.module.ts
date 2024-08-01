import { Module } from '@nestjs/common';

import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [WorkflowRunnerModule, WorkflowTriggerModule],
})
export class WorkflowModule {}
