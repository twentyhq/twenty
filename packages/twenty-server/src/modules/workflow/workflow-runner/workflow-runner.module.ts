import { Module } from '@nestjs/common';

import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowRunnerJob } from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';

@Module({
  imports: [WorkflowCommonModule, WorkflowExecutorModule],
  providers: [WorkflowRunnerService, WorkflowRunnerJob],
  exports: [WorkflowRunnerService],
})
export class WorkflowRunnerModule {}
