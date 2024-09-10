import { Module } from '@nestjs/common';

import { WorkflowStatusesUpdateJob } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { WorkflowVersionStatusListener } from 'src/modules/workflow/workflow-status/listeners/workflow-version-status.listener';

@Module({
  providers: [WorkflowStatusesUpdateJob, WorkflowVersionStatusListener],
})
export class WorkflowStatusModule {}
