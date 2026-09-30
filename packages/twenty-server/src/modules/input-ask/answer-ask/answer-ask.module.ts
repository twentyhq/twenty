import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { AnswerAgentChatQuestionResolver } from 'src/modules/input-ask/answer-ask/resolvers/answer-agent-chat-question.resolver';
import { AnswerAskResolver } from 'src/modules/input-ask/answer-ask/resolvers/answer-ask.resolver';
import { AnswerAskService } from 'src/modules/input-ask/answer-ask/services/answer-ask.service';
import { InputAskModule } from 'src/modules/input-ask/input-ask.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  imports: [
    AiAgentExecutionModule,
    AiChatModule,
    AgentChatStreamStateModule,
    AiBillingModule,
    InputAskModule,
    PermissionsModule,
    ToolProviderModule,
    WorkflowExecutionContextModule,
    WorkflowRunModule,
    WorkflowRunnerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AnswerAskService,
    AnswerAskResolver,
    AnswerAgentChatQuestionResolver,
    AiGraphqlApiExceptionInterceptor,
  ],
})
export class AnswerAskModule {}
