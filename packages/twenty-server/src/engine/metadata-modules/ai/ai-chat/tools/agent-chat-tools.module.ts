import { Module } from '@nestjs/common';

import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';

@Module({
  imports: [AgentChatThreadModule],
  providers: [AttachConversationToRecordTool],
})
export class AgentChatToolsModule {}
