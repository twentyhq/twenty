import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step.input';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CallerGuard } from 'src/engine/guards/caller.guard';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { AnswerAskResultDTO } from 'src/modules/input-ask/answer-ask/dtos/answer-ask-result.dto';
import { AnswerAskInput } from 'src/modules/input-ask/answer-ask/dtos/answer-ask.input';
import { AnswerAskService } from 'src/modules/input-ask/answer-ask/services/answer-ask.service';
import { InputAskGraphqlApiExceptionFilter } from 'src/modules/input-ask/filters/input-ask-graphql-api-exception.filter';
import {
  InputAskException,
  InputAskExceptionCode,
} from 'src/modules/input-ask/input-ask.exception';

// Served on /graphql: the permission an answer needs depends on what the Ask
// gates, a chat or a workflow run, so it is checked per call rather than by a
// class guard.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  CallerGuard({
    userSession: true,
    oauthClient: { requireUser: true },
    application: { requireUser: true },
  }),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  InputAskGraphqlApiExceptionFilter,
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class AnswerAskResolver {
  constructor(private readonly answerAskService: AnswerAskService) {}

  @Mutation(() => AnswerAskResultDTO)
  @UseGuards(CustomPermissionGuard)
  async answerAsk(
    @Args('input') { askId, response, modelId }: AnswerAskInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AnswerAskResultDTO> {
    const { streamId, threadId, turnId } = await this.answerAskService.answer({
      askId,
      response,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    if (isDefined(streamId) && isDefined(threadId)) {
      tagAiChatStreamScope({
        streamId,
        turnId,
        threadId,
        workspaceId: workspace.id,
      });
    }

    return { streamId };
  }

  // Kept so clients built before answerAsk keep working for a release.
  @Mutation(() => Boolean, {
    deprecationReason: "Use answerAsk with the form step's Ask",
  })
  @UseGuards(CustomPermissionGuard)
  async submitFormStep(
    @Args('input') { stepId, workflowRunId, response }: SubmitFormStepInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    if (!isPlainObject(response)) {
      throw new InputAskException(
        'A form response must be an object',
        InputAskExceptionCode.INVALID_ASK_RESPONSE,
      );
    }

    await this.answerAskService.answerFormStepByStep({
      workflowRunId,
      stepId,
      response,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    return true;
  }
}
