import { Module } from '@nestjs/common';

import { IteratorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/iterator.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [WorkflowRunModule],
  providers: [IteratorWorkflowAction],
  exports: [IteratorWorkflowAction],
})
export class IteratorActionModule {}
