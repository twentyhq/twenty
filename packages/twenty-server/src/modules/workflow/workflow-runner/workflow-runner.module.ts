import { Module } from '@nestjs/common';

import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowRunnerJob } from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [WorkflowCommonModule, ServerlessFunctionModule],
  providers: [WorkflowRunnerService, WorkflowRunnerJob],
  exports: [WorkflowRunnerService],
})
export class WorkflowRunnerModule {}
