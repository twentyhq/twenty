import { Module } from '@nestjs/common';

import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowRunInboxSenderModule } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.module';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { WorkflowStepWaitModule } from 'src/modules/workflow/workflow-wait/workflow-step-wait.module';

@Module({
  imports: [
    AiAgentExecutionModule,
    WorkflowRunInboxSenderModule,
    WorkflowStepWaitModule,
  ],
  providers: [SendChatMessageWorkflowAction],
  exports: [SendChatMessageWorkflowAction],
})
export class SendChatMessageActionModule {}
