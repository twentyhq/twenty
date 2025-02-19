import { Module } from '@nestjs/common';

import { WorkflowStatusesUpdateJob } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { WorkflowVersionStatusListener } from 'src/modules/workflow/workflow-status/listeners/workflow-version-status.listener';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [WorkflowStatusesUpdateJob, WorkflowVersionStatusListener],
})
export class WorkflowStatusModule {}
