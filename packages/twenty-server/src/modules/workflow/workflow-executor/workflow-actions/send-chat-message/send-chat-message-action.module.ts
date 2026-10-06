import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AgentRunConversationModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/agent-run-conversation.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowRunInboxSenderModule } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.module';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';

@Module({
  imports: [
    AgentChatThreadModule,
    AgentRunConversationModule,
    WorkflowExecutionContextModule,
    WorkflowRunInboxSenderModule,
    ToolProviderModule,
  ],
  providers: [SendChatMessageWorkflowAction],
  exports: [SendChatMessageWorkflowAction],
})
export class SendChatMessageActionModule {}
