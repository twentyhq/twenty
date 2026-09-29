import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { ResolveToolCallResultDTO } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/dtos/resolve-tool-call-result.dto';
import { ResolveToolCallInput } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/dtos/resolve-tool-call.input';
import { ToolCallResolutionService } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/services/tool-call-resolution.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

// Served on /graphql beside submitFormStep: which permission an answer needs
// depends on whether it resumes a chat or a workflow run, so it is checked per
// call rather than by a class guard.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class ToolCallResolutionResolver {
  constructor(
    private readonly toolCallResolutionService: ToolCallResolutionService,
  ) {}

  @Mutation(() => ResolveToolCallResultDTO)
  async resolveToolCall(
    @Args('input') { threadId, toolCallId, output, modelId }: ResolveToolCallInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ResolveToolCallResultDTO> {
    const { streamId, turnId } = await this.toolCallResolutionService.resolve({
      threadId,
      toolCallId,
      output,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    if (isDefined(streamId)) {
      tagAiChatStreamScope({
        streamId,
        turnId,
        threadId,
        workspaceId: workspace.id,
      });
    }

    return { streamId };
  }
}
