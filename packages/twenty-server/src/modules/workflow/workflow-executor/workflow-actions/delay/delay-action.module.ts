import { Module } from '@nestjs/common';

import { DelayWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay.workflow-action';
import { DelayedResumeJob } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/jobs/delayed-resume.job';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [WorkflowRunModule, WorkflowRunQueueModule],
  providers: [DelayWorkflowAction, DelayedResumeJob],
  exports: [DelayWorkflowAction],
})
export class DelayActionModule {}
