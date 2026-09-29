import { Injectable } from '@nestjs/common';

import { generateId } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingToolResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';
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
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

type ResolvedToolCall = {
  threadId: string;
  toolCallId: string;
  toolPart: NonNullable<Awaited<ReturnType<AgentChatService['findToolPart']>>>;
  resolution: Extract<PausingToolResolution, { isValid: true }>;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
};

// Every widget that blocks a conversation on a person is answered here: the
// Ask moving out of PENDING is the one claim that lets exactly one answer
// resume the chat stream or the workflow run that is waiting on it.
@Injectable()
export class ToolCallResolutionService {
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
  ) {}

  async resolve({
    threadId,
    toolCallId,
    output,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
  }: {
    threadId: string;
    toolCallId: string;
    output: unknown;
    modelId?: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
  }): Promise<{ streamId: string | null; turnId: string | null }> {
    const inputAsk = await this.inputAskWorkspaceService.findReadableForToolCall(
      { workspaceId: workspace.id, threadId, toolCallId },
    );

    if (!isDefined(inputAsk)) {
      throw new AiException(
        'Tool call not found',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    if (inputAsk.status !== InputAskStatus.PENDING) {
      throw new AiException(
        'This tool call is no longer awaiting an answer',
        AiExceptionCode.TOOL_CALL_NOT_PENDING,
      );
    }

    const toolPart = await this.agentChatService.findToolPart({
      threadId,
      toolCallId,
      workspaceId: workspace.id,
    });
    const pausingToolCall = isDefined(toolPart?.toolName)
      ? PAUSING_TOOLS.get(toolPart.toolName)?.parseCall(toolPart.toolInput)
      : undefined;

    if (!isDefined(toolPart) || !isDefined(pausingToolCall)) {
      throw new AiException(
        'Tool call not found',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    const resolution = pausingToolCall.resolve(output);

    if (!resolution.isValid) {
      throw new AiException(
        resolution.errorMessage,
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

    const resolvedToolCall: ResolvedToolCall = {
      threadId,
      toolCallId,
      toolPart,
      resolution,
      userWorkspaceId,
      workspace,
    };

    if (isDefined(inputAsk.workflowRunId)) {
      await this.resolveForWorkflowRun({
        ...resolvedToolCall,
        workflowRunId: inputAsk.workflowRunId,
      });

      return { streamId: null, turnId: null };
    }

    return this.resolveForChat({
      ...resolvedToolCall,
      modelId,
      workspaceMemberId,
    });
  }

  private async resolveForChat({
    threadId,
    toolCallId,
    toolPart,
    resolution,
    userWorkspaceId,
    workspace,
    modelId,
    workspaceMemberId,
  }: ResolvedToolCall & {
    modelId?: string;
    workspaceMemberId: string;
  }): Promise<{ streamId: string; turnId: string | null }> {
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

    const hasClaimedStream = await this.agentChatStreamingService.tryClaimStream(
      { threadId, workspaceId, streamId },
    );

    if (!hasClaimedStream) {
      throw new AiException(
        'The conversation is still busy with another response',
        AiExceptionCode.TOOL_CALL_NOT_PENDING,
      );
    }

    const hasAnswered = await this.inputAskWorkspaceService
      .answer({
        workspaceId,
        key: { threadId, toolCallId },
        response: resolution.output,
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

      throw new AiException(
        'This tool call is no longer awaiting an answer',
        AiExceptionCode.TOOL_CALL_NOT_PENDING,
      );
    }

    let turnId: string | null;

    // The answer is already recorded, so a failure from here on leaves a
    // failed turn to retry rather than an answer that can be given twice.
    try {
      await this.agentChatService.updateToolPartOutput({
        partId: toolPart.id,
        toolOutput: resolution.toolResult,
        workspaceId,
      });

      const answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: resolution.answerText }],
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

    return { streamId, turnId };
  }

  private async resolveForWorkflowRun({
    threadId,
    toolCallId,
    resolution,
    userWorkspaceId,
    workspace,
    workflowRunId,
  }: ResolvedToolCall & { workflowRunId: string }): Promise<void> {
    const workspaceId = workspace.id;

    // The same permission that lets someone submit a workflow's form.
    await this.assertHasSettingPermission({
      setting: PermissionFlagType.WORKFLOWS,
      userWorkspaceId,
      workspaceId,
    });

    if (!(await this.isWorkflowRunReadable(workflowRunId))) {
      throw new AiException(
        'Tool call not found',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    const stepResolution =
      await this.workflowRunnerWorkspaceService.resolveAgentStepToolCall({
        workspaceId,
        workflowRunId,
        threadId,
        toolCallId,
        response: resolution.output,
        toolResult: resolution.toolResult,
        answerText: resolution.answerText,
        senderUserWorkspaceId: userWorkspaceId,
      });

    if (stepResolution.status !== 'RESOLVED') {
      throw new AiException(
        'This workflow is no longer waiting for this answer',
        AiExceptionCode.TOOL_CALL_NOT_PENDING,
      );
    }

    await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });
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
      throw new AiException(
        `Resolving this tool call requires the ${setting} permission`,
        AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
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
