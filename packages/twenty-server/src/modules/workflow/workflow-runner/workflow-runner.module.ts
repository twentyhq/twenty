import { Module } from '@nestjs/common';

import { WorkflowRunService } from 'src/modules/workflow/workflow-runner/services/workflow-run.service';
import { WorkflowRunJob } from 'src/modules/workflow/workflow-runner/jobs/workflow-run.job';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [WorkflowCommonModule, ServerlessFunctionModule],
  providers: [WorkflowRunService, WorkflowRunJob],
})
export class WorkflowRunnerModule {}
