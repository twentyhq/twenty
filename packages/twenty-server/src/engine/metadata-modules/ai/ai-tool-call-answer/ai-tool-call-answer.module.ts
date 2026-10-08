import { Module } from '@nestjs/common';

import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { ToolCallAnswerResolver } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/resolvers/tool-call-answer.resolver';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

// an answer resumes a chat here, or resolves the wake-up of the run or caller that waits on it
@Module({
  imports: [
    AgentHistoryModule,
    AiAgentExecutionModule,
    AiChatModule,
    AgentChatStreamStateModule,
    AgentChatThreadLifecycleModule,
    PendingWakeUpModule,
    PermissionsModule,
    ToolProviderModule,
  ],
  providers: [ToolCallAnswerService, ToolCallAnswerResolver],
})
export class AiToolCallAnswerModule {}
