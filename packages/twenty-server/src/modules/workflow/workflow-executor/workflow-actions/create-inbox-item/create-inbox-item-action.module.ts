import { Module } from '@nestjs/common';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { CreateInboxItemWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/create-inbox-item.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [ToolModule, WorkflowRunModule],
  providers: [CreateInboxItemWorkflowAction],
  exports: [CreateInboxItemWorkflowAction],
})
export class CreateInboxItemActionModule {}
