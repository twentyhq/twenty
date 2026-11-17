import { Module } from '@nestjs/common';

import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AttachConversationToRecordsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-records.tool';

@Module({
  imports: [AgentChatThreadModule],
  providers: [AttachConversationToRecordsTool],
})
export class AgentChatToolsModule {}
