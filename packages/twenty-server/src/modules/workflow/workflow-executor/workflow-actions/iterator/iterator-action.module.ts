import { forwardRef, Module } from '@nestjs/common';

import { IteratorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/iterator.workflow-action';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [forwardRef(() => WorkflowExecutorModule), WorkflowRunModule],
  providers: [IteratorWorkflowAction],
  exports: [IteratorWorkflowAction],
})
export class IteratorActionModule {}
