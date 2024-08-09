import { Module } from '@nestjs/common';

import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowRunnerJob } from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionRunnerModule } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.module';

@Module({
  imports: [WorkflowCommonModule, WorkflowActionRunnerModule],
  providers: [WorkflowRunnerService, WorkflowRunnerJob],
  exports: [WorkflowRunnerService],
})
export class WorkflowRunnerModule {}
