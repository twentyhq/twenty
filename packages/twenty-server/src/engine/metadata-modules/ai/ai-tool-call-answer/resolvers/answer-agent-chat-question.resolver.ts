import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentChatQuestionAnswerInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-question-answer.input';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

// The metadata API's answer mutation from before answerToolCall, kept so
// clients built against it keep working for a release. It answers the
// questions the message asked, with the same checks as answerToolCall.
@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class AnswerAgentChatQuestionResolver {
  constructor(private readonly toolCallAnswerService: ToolCallAnswerService) {}

  @Mutation(() => SendChatMessageResultDTO, {
    deprecationReason: 'Use answerToolCall with the questions tool call',
  })
  @UseGuards(CustomPermissionGuard)
  async answerAgentChatQuestion(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @Args('answers', { type: () => [AgentChatQuestionAnswerInput] })
    answers: AgentChatQuestionAnswerInput[],
    @Args('modelId', { type: () => String, nullable: true })
    modelId: string | undefined,
    @Args('fileAttachments', {
      type: () => [FileAttachmentInput],
      nullable: true,
    })
    fileAttachments: FileAttachmentInput[] | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    if (isNonEmptyArray(fileAttachments)) {
      throw new AiException(
        'Files can no longer be sent with an answer: send them in a message',
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

    const { streamId, turnId } =
      await this.toolCallAnswerService.answerQuestionsOfMessage({
        threadId,
        messageId,
        response: { answers: answers.map((answer) => ({ ...answer })) },
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

    return { messageId, queued: false, streamId: streamId ?? undefined };
  }
}
