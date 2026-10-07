import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { ToolCallAnswerResolver } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/resolvers/tool-call-answer.resolver';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

// an answer resumes a chat here, or continues the suspended run its caller waits on
@Module({
  imports: [
    AgentHistoryModule,
    AiAgentExecutionModule,
    AiChatModule,
    AgentChatStreamStateModule,
    PermissionsModule,
    ToolProviderModule,
  ],
  providers: [
    ToolCallAnswerService,
    ToolCallAnswerResolver,
    AiGraphqlApiExceptionInterceptor,
  ],
})
export class AiToolCallAnswerModule {}
