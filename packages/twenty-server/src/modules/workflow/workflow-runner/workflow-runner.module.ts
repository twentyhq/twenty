import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionRunnerModule } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.module';
import { WorkflowRunnerJob } from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowActionRunnerModule,
    WorkflowStatusModule,
  ],
  providers: [WorkflowRunnerService, WorkflowRunnerJob],
  exports: [WorkflowRunnerService],
})
export class WorkflowRunnerModule {}
