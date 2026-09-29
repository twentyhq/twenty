import { Injectable } from '@nestjs/common';

import { generateId } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import {
  InputAskException,
  InputAskExceptionCode,
} from 'src/modules/input-ask/input-ask.exception';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

type AnswerAskArgs = {
  askId: string;
  response: Record<string, unknown>;
  modelId?: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  workspace: WorkspaceEntity;
};

type AnswerAskOutcome = {
  streamId: string | null;
  threadId: string | null;
  turnId: string | null;
};

type ToolCallToAnswer = {
  threadId: string;
  toolCallId: string;
  toolPart: NonNullable<Awaited<ReturnType<AgentChatService['findToolPart']>>>;
  pausingToolCall: PausingToolCall;
  output: Record<string, unknown>;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
};

const NO_STREAM: AnswerAskOutcome = {
  streamId: null,
  threadId: null,
  turnId: null,
};

// Every pause for a person is answered here, by its Ask: the Ask says what it
// gates, a form step, a chat's tool call or a run agent's tool call, and
// moving it out of PENDING is the one claim that lets exactly one answer
// resume what waits on it.
@Injectable()
export class AnswerAskService {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly actorService: AgentChatActorService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly toolRegistryService: ToolRegistryService,
  ) {}

  async answer(args: AnswerAskArgs): Promise<AnswerAskOutcome> {
    const workspaceId = args.workspace.id;

    const inputAsk = await this.inputAskWorkspaceService.findReadable({
      workspaceId,
      inputAskId: args.askId,
    });

    if (!isDefined(inputAsk)) {
      throw new InputAskException(
        'Ask not found',
        InputAskExceptionCode.ASK_NOT_FOUND,
      );
    }

    if (inputAsk.status !== InputAskStatus.PENDING) {
      throw this.notPending();
    }

    if (isDefined(inputAsk.threadId) && isDefined(inputAsk.toolCallId)) {
      return this.answerToolCall({
        ...args,
        threadId: inputAsk.threadId,
        toolCallId: inputAsk.toolCallId,
        workflowRunId: inputAsk.workflowRunId,
      });
    }

    if (isDefined(inputAsk.workflowRunId) && isDefined(inputAsk.stepId)) {
      await this.answerFormStep({
        ...args,
        form: inputAsk.form,
        workflowRunId: inputAsk.workflowRunId,
        stepId: inputAsk.stepId,
      });

      return NO_STREAM;
    }

    throw new InputAskException(
      'This Ask gates nothing that can be answered',
      InputAskExceptionCode.ASK_NOT_FOUND,
    );
  }

  private async answerFormStep({
    response,
    userWorkspaceId,
    workspace,
    form,
    workflowRunId,
    stepId,
  }: AnswerAskArgs & {
    form: InputAskWorkspaceEntity['form'];
    workflowRunId: string;
    stepId: string;
  }): Promise<void> {
    const workspaceId = workspace.id;

    if (form?.kind === 'formFields') {
      const fieldNames = new Set(form.fields.map((field) => field.name));
      const unknownFieldName = Object.keys(response).find(
        (fieldName) => !fieldNames.has(fieldName),
      );

      if (isDefined(unknownFieldName)) {
        throw new InputAskException(
          `The form has no field named ${unknownFieldName}`,
          InputAskExceptionCode.INVALID_ASK_RESPONSE,
        );
      }
    }

    await this.assertCanAnswerForWorkflowRun({
      userWorkspaceId,
      workspaceId,
      workflowRunId,
    });

    const hasSubmitted =
      await this.workflowRunnerWorkspaceService.submitFormStep({
        workspaceId,
        workflowRunId,
        stepId,
        response,
      });

    if (!hasSubmitted) {
      throw this.notPending();
    }
  }

  private async answerToolCall({
    threadId,
    toolCallId,
    workflowRunId,
    response,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
  }: AnswerAskArgs & {
    threadId: string;
    toolCallId: string;
    workflowRunId: string | null;
  }): Promise<AnswerAskOutcome> {
    const toolPart = await this.agentChatService.findToolPart({
      threadId,
      toolCallId,
      workspaceId: workspace.id,
    });
    const pausingToolCall = isDefined(toolPart?.toolName)
      ? PAUSING_TOOLS.get(toolPart.toolName)?.parseCall(toolPart.toolInput)
      : undefined;

    if (!isDefined(toolPart) || !isDefined(pausingToolCall)) {
      throw new InputAskException(
        'The tool call this Ask waits on could not be found',
        InputAskExceptionCode.ASK_NOT_FOUND,
      );
    }

    const validation = pausingToolCall.validate(response);

    if (!validation.isValid) {
      throw new InputAskException(
        validation.errorMessage,
        InputAskExceptionCode.INVALID_ASK_RESPONSE,
      );
    }

    const toolCallToAnswer: ToolCallToAnswer = {
      threadId,
      toolCallId,
      toolPart,
      pausingToolCall,
      output: validation.output,
      userWorkspaceId,
      workspace,
    };

    if (isDefined(workflowRunId)) {
      await this.answerWorkflowRunToolCall({
        ...toolCallToAnswer,
        workflowRunId,
      });

      return NO_STREAM;
    }

    return this.answerChatToolCall({
      ...toolCallToAnswer,
      modelId,
      workspaceMemberId,
    });
  }

  private async answerChatToolCall({
    threadId,
    toolCallId,
    toolPart,
    pausingToolCall,
    output,
    userWorkspaceId,
    workspace,
    modelId,
    workspaceMemberId,
  }: ToolCallToAnswer & {
    modelId?: string;
    workspaceMemberId: string;
  }): Promise<AnswerAskOutcome> {
    const workspaceId = workspace.id;

    await this.assertHasSettingPermission({
      setting: PermissionFlagType.AI,
      userWorkspaceId,
      workspaceId,
    });

    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    this.aiModelRegistryService.validateModelAvailability(
      getChatModelId({ requestedModelId: modelId, workspace }),
    );

    const thread = await this.agentChatService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    await this.actorService.authorizeToolCallResolution({
      workspaceId,
      threadId,
      messageId: toolPart.messageId,
    });

    await this.agentChatStreamingService.reapDeadStream({
      thread,
      workspaceId,
    });

    const streamId = generateId();

    const hasClaimedStream =
      await this.agentChatStreamingService.tryClaimStream({
        threadId,
        workspaceId,
        streamId,
      });

    if (!hasClaimedStream) {
      throw new InputAskException(
        'The conversation is still busy with another response',
        InputAskExceptionCode.ASK_NOT_PENDING,
      );
    }

    const hasAnswered = await this.inputAskWorkspaceService
      .answer({
        workspaceId,
        key: { threadId, toolCallId },
        response: output,
      })
      .catch(async (error: unknown) => {
        await this.agentChatStreamingService.releaseStreamClaim(
          threadId,
          workspaceId,
          streamId,
        );
        throw error;
      });

    if (!hasAnswered) {
      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
      );

      throw this.notPending();
    }

    let turnId: string | null;

    // The answer is already recorded, so a failure from here on leaves a
    // failed turn to retry rather than an answer that can be given twice.
    try {
      const completion = await pausingToolCall.complete(
        output,
        this.buildCompletionContext({ workspaceId, userWorkspaceId, threadId }),
      );

      await this.agentChatService.updateToolPartOutput({
        partId: toolPart.id,
        toolOutput: completion.toolResult,
        workspaceId,
      });

      const answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: completion.answerText }],
        },
        workspaceId,
      });

      turnId = answerMessage.turnId;

      await this.agentChatStreamingService.enqueueResumeStream({
        threadId,
        userWorkspaceId,
        workspaceMemberId,
        workspace,
        turnId,
        streamId,
        modelId,
        messageId: answerMessage.id,
      });
    } catch (error) {
      const streamError = mapErrorToStreamError(error);

      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
        {
          lastStreamError: {
            ...streamError,
            failedAt: new Date().toISOString(),
          },
        },
      );

      await this.eventPublisherService
        .publish({
          threadId,
          workspaceId,
          event: {
            type: 'stream-error',
            code: streamError.code,
            message: streamError.message,
          },
        })
        .catch(() => {});

      throw error;
    }

    await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });

    return { streamId, threadId, turnId };
  }

  private async answerWorkflowRunToolCall({
    threadId,
    toolCallId,
    pausingToolCall,
    output,
    userWorkspaceId,
    workspace,
    workflowRunId,
  }: ToolCallToAnswer & { workflowRunId: string }): Promise<void> {
    const workspaceId = workspace.id;

    await this.assertCanAnswerForWorkflowRun({
      userWorkspaceId,
      workspaceId,
      workflowRunId,
    });

    const claim =
      await this.workflowRunnerWorkspaceService.claimAgentStepToolCall({
        workspaceId,
        workflowRunId,
        threadId,
        toolCallId,
        response: output,
      });

    if (claim.status !== 'RESOLVED') {
      throw this.notPending();
    }

    const completion = await pausingToolCall
      .complete(
        output,
        this.buildCompletionContext({ workspaceId, userWorkspaceId, threadId }),
      )
      .catch(async (error: unknown) => {
        await this.workflowRunnerWorkspaceService.failAnsweredAgentStep({
          workspaceId,
          workflowRunId,
        });
        throw error;
      });

    await this.workflowRunnerWorkspaceService.resumeAnsweredAgentStep({
      workspaceId,
      workflowRunId,
      stepId: claim.stepId,
      threadId,
      toolCallId,
      toolResult: completion.toolResult,
      answerText: completion.answerText,
      senderUserWorkspaceId: userWorkspaceId,
    });

    await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });
  }

  // The same permission that lets someone run a workflow, on a run they can
  // read.
  private async assertCanAnswerForWorkflowRun({
    userWorkspaceId,
    workspaceId,
    workflowRunId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    await this.assertHasSettingPermission({
      setting: PermissionFlagType.WORKFLOWS,
      userWorkspaceId,
      workspaceId,
    });

    if (!(await this.isWorkflowRunReadable(workflowRunId))) {
      throw new InputAskException(
        'Ask not found',
        InputAskExceptionCode.ASK_NOT_FOUND,
      );
    }
  }

  // Built only when a pausing tool runs another tool, and as the person who
  // answered: their role and connected accounts decide what it may do.
  private buildCompletionContext({
    workspaceId,
    userWorkspaceId,
    threadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadId: string;
  }): PausingToolCompletionContext {
    return {
      executeTool: async (toolName, toolArguments) =>
        this.toolRegistryService.resolveAndExecute(
          toolName,
          toolArguments,
          await this.buildAnswererToolContext({
            workspaceId,
            userWorkspaceId,
            threadId,
          }),
        ),
    };
  }

  private async buildAnswererToolContext({
    workspaceId,
    userWorkspaceId,
    threadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadId: string;
  }): Promise<ToolContext> {
    const authContext = workspaceAuthContextStorage.getStore();

    if (!isDefined(authContext) || !isUserAuthContext(authContext)) {
      throw new InputAskException(
        'Answering requires a signed-in person',
        InputAskExceptionCode.ASK_ANSWER_FORBIDDEN,
      );
    }

    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);
    const { actorContext, roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspaceId,
      );

    return {
      workspaceId,
      roleId,
      rolePermissionConfig:
        resolveRolePermissionConfig({
          authContext,
          userWorkspaceRoleMap,
          apiKeyRoleMap: {},
        }) ?? undefined,
      authContext,
      actorContext,
      userId,
      userWorkspaceId,
      threadId,
      locale: userContext.locale as ToolContext['locale'],
    };
  }

  private async assertHasSettingPermission({
    setting,
    userWorkspaceId,
    workspaceId,
  }: {
    setting: PermissionFlagType;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const requestAuthContext = workspaceAuthContextStorage.getStore();
    const applicationId =
      isDefined(requestAuthContext) && isUserAuthContext(requestAuthContext)
        ? requestAuthContext.application?.id
        : undefined;

    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting,
        applicationId,
      });

    if (!hasPermission) {
      throw new InputAskException(
        `Answering this Ask requires the ${setting} permission`,
        InputAskExceptionCode.ASK_ANSWER_FORBIDDEN,
      );
    }
  }

  private async isWorkflowRunReadable(workflowRunId: string): Promise<boolean> {
    try {
      const workflowRun =
        await this.workspaceOrmManager.executeInWorkspaceContext(() =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            )
            .findOne({ where: { id: workflowRunId }, select: { id: true } }),
        );

      return isDefined(workflowRun);
    } catch (error) {
      if (error instanceof PermissionsException) {
        return false;
      }

      throw error;
    }
  }

  private notPending(): InputAskException {
    return new InputAskException(
      'This Ask is no longer waiting for an answer',
      InputAskExceptionCode.ASK_NOT_PENDING,
    );
  }

  private async publishToolCallResolved({
    threadId,
    toolCallId,
    workspaceId,
  }: {
    threadId: string;
    toolCallId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.eventPublisherService
      .publish({
        threadId,
        workspaceId,
        event: { type: 'tool-call-resolved', toolCallId },
      })
      .catch(() => {});
  }
}
