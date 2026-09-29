import { Module } from '@nestjs/common';

import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { ToolCallResolutionResolver } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/resolvers/tool-call-resolution.resolver';
import { ToolCallResolutionService } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/services/tool-call-resolution.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { InputAskModule } from 'src/modules/input-ask/input-ask.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  imports: [
    AiChatModule,
    AgentChatStreamStateModule,
    AiBillingModule,
    InputAskModule,
    PermissionsModule,
    WorkflowRunnerModule,
  ],
  providers: [
    ToolCallResolutionService,
    ToolCallResolutionResolver,
    AiGraphqlApiExceptionInterceptor,
  ],
})
export class AiToolCallResolutionModule {}
