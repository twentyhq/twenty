import { Module } from '@nestjs/common';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { CreateCalendarEventWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/create-calendar-event.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [ToolModule, WorkflowExecutionContextModule, WorkflowRunModule],
  providers: [CreateCalendarEventWorkflowAction],
  exports: [CreateCalendarEventWorkflowAction],
})
export class CreateCalendarEventActionModule {}
