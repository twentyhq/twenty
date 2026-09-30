import { Module } from '@nestjs/common';

import { WorkflowAgentConversationModule } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/workflow-agent-conversation.module';
import { FormWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form.workflow-action';

@Module({
  imports: [WorkflowAgentConversationModule],
  providers: [FormWorkflowAction],
  exports: [FormWorkflowAction],
})
export class FormActionModule {}
