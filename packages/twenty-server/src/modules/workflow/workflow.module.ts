import { Module } from '@nestjs/common';

import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  imports: [WorkflowRunnerModule],
})
export class WorkflowModule {}
