import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { ToolCallAnswerResolver } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/resolvers/tool-call-answer.resolver';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

// Answering a paused call can resume a chat or a workflow run, so this sits
// above both.
@Module({
  imports: [
    AgentHistoryModule,
    AiAgentExecutionModule,
    AiChatModule,
    AgentChatStreamStateModule,
    AiBillingModule,
    PermissionsModule,
    ToolProviderModule,
    WorkflowRunModule,
    WorkflowRunnerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ToolCallAnswerService,
    ToolCallAnswerResolver,
    AiGraphqlApiExceptionInterceptor,
  ],
})
export class AiToolCallAnswerModule {}
