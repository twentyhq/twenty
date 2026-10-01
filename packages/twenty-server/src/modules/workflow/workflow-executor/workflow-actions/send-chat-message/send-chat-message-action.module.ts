import { Module } from '@nestjs/common';

import { AgentInboxModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-inbox.module';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';

@Module({
  imports: [AgentInboxModule],
  providers: [SendChatMessageWorkflowAction],
  exports: [SendChatMessageWorkflowAction],
})
export class SendChatMessageActionModule {}
