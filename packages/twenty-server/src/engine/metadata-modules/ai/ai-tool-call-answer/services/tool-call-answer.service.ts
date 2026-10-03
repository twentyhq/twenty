import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { generateId } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { parsePausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/parse-pausing-tool-call.util';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { readToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-tool-call-workflow-step.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

type AnswerToolCallArgs = {
  threadId: string;
  toolCallId: string;
  response: Record<string, unknown>;
  modelId?: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  workspace: WorkspaceEntity;
};

type AnswerToolCallOutcome = {
  streamId: string | null;
  turnId: string | null;
};

// an answer takes the stream claim only while the conversation still waits, so each call is answered once
@Injectable()
export class ToolCallAnswerService {
  private readonly logger = new Logger(ToolCallAnswerService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly actorService: AgentChatActorService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly toolRegistryService: ToolRegistryService,
  ) {}

  async answer(args: AnswerToolCallArgs): Promise<AnswerToolCallOutcome> {
    const { threadId, toolCallId, userWorkspaceId, workspace } = args;
    const workspaceId = workspace.id;

    const [thread, toolPart] = await Promise.all([
      this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
        select: [
          'id',
          'workflowRunId',
          'activeStreamId',
          'pendingQuestionMessageId',
        ],
      }),
      this.agentChatService.findToolPart({ threadId, toolCallId, workspaceId }),
    ]);
    const pausingToolCall = parsePausingToolCall(toolPart);

    if (
      !isDefined(thread) ||
      !isDefined(toolPart) ||
      !isDefined(pausingToolCall)
    ) {
      throw new AiException(
        'The tool call to answer could not be found',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    // a run's own conversation, or a member's inbox where a step posted a call it waits on
    const inboxWorkflowStep = isDefined(thread.workflowRunId)
      ? null
      : readToolCallWorkflowStep(toolPart.toolOutput);
    const workflowRunId =
      thread.workflowRunId ?? inboxWorkflowStep?.workflowRunId ?? null;

    if (isDefined(thread.workflowRunId)) {
      await this.assertCanAnswerForWorkflowRun({
        userWorkspaceId,
        workspaceId,
        workflowRunId: thread.workflowRunId,
      });
    } else {
      await this.assertCanAnswerInChat({
        ...args,
        messageId: toolPart.messageId,
        isStartingChatTurn: !isDefined(inboxWorkflowStep),
      });
    }

    if (thread.pendingQuestionMessageId !== toolPart.messageId) {
      throw this.notPending();
    }

    const validation = pausingToolCall.validate(args.response);

    if (!validation.isValid) {
      throw new AiException(
        validation.errorMessage,
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

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
        where: { pendingQuestionMessageId: toolPart.messageId },
      });

    if (!hasClaimedStream) {
      throw new AiException(
        'The conversation is busy with another answer or response',
        AiExceptionCode.TOOL_CALL_NOT_PENDING,
        { userFriendlyMessage: msg`This conversation is busy. Try again.` },
      );
    }

    let step: WorkflowAction | null = null;
    let isLastAnswer: boolean;
    let answerText: string;
    let toolResult: Record<string, unknown>;

    try {
      const awaitingToolParts =
        await this.agentChatService.findAwaitingToolParts({
          messageId: toolPart.messageId,
          workspaceId,
        });

      if (!awaitingToolParts.some((part) => part.id === toolPart.id)) {
        throw this.notPending();
      }

      if (isDefined(workflowRunId)) {
        step = await this.workflowRunWorkspaceService.findStepAwaitingAnswer({
          threadId,
          workflowRunId,
          workspaceId,
          expectedStepId: inboxWorkflowStep?.stepId,
        });

        if (
          !isDefined(step) &&
          isDefined(inboxWorkflowStep) &&
          (await this.workflowRunWorkspaceService.isStepStillRunning({
            ...inboxWorkflowStep,
            workspaceId,
          }))
        ) {
          throw new AiException(
            'The workflow step is not ready for an answer yet',
            AiExceptionCode.TOOL_CALL_NOT_PENDING,
            {
              userFriendlyMessage: msg`This workflow is still getting ready. Try again in a moment.`,
            },
          );
        }

        if (!isDefined(step)) {
          await this.agentChatService.closePendingToolCalls({
            threadId,
            messageId: toolPart.messageId,
            workspaceId,
          });

          throw this.notPending();
        }
      }

      const completion = await pausingToolCall.complete({
        output: validation.output,
        context: this.buildCompletionContext({
          workspaceId,
          userWorkspaceId,
          threadId,
        }),
      });

      isLastAnswer = awaitingToolParts.length === 1;

      await this.agentChatService.recordToolCallAnswer({
        threadId,
        messageId: toolPart.messageId,
        partId: toolPart.id,
        toolOutput: completion.toolResult,
        isLastAnswer,
        workspaceId,
      });

      answerText = completion.answerText;
      toolResult = completion.toolResult;
    } catch (error) {
      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
      );

      throw error;
    }

    // the answer is recorded and cannot be resubmitted, so failures fail the turn or run for retry
    try {
      const answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: answerText }],
        },
        workspaceId,
      });

      await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });

      // An answer is a message the member sent, so the chat moves up and
      // comes back to their inbox. A run's conversation is not in chat lists.
      // The answer is already recorded and cannot be given again, so a
      // failure here must not fail the turn
      if (!isDefined(workflowRunId)) {
        await this.agentChatService
          .notifyThreadActivityUpdated({
            threadId,
            workspaceMemberId: args.workspaceMemberId,
            workspaceId,
            text: answerText,
          })
          .catch((error: unknown) =>
            this.logger.warn(
              `Could not record answer activity on thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
      }

      // runs resume in their own executor, and only the last answer resumes a chat
      if (isDefined(step) || !isLastAnswer) {
        await this.agentChatStreamingService.releaseStreamClaim(
          threadId,
          workspaceId,
          streamId,
        );

        if (isLastAnswer && isDefined(workflowRunId) && isDefined(step)) {
          await this.workflowRunnerWorkspaceService.resumeAnsweredStep({
            workspaceId,
            workflowRunId,
            step,
            threadId,
            response: validation.output,
            toolResult,
          });
        }

        return { streamId: null, turnId: answerMessage.turnId };
      }

      await this.agentChatStreamingService.enqueueResumeStream({
        threadId,
        userWorkspaceId,
        workspaceMemberId: args.workspaceMemberId,
        workspace,
        turnId: answerMessage.turnId,
        streamId,
        modelId: args.modelId,
        messageId: answerMessage.id,
      });

      return { streamId, turnId: answerMessage.turnId };
    } catch (error) {
      await this.failAfterAnswer({
        threadId,
        workspaceId,
        streamId,
        workflowRunId,
        error,
      });

      throw error;
    }
  }

  private async failAfterAnswer({
    threadId,
    workspaceId,
    streamId,
    workflowRunId,
    error,
  }: {
    threadId: string;
    workspaceId: string;
    streamId: string;
    workflowRunId: string | null;
    error: unknown;
  }): Promise<void> {
    if (isDefined(workflowRunId)) {
      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
      );

      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'The run could not resume after its question was answered',
      });

      return;
    }

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
  }

  // an answer that resumes a workflow step starts no chat turn, so it skips the model and
  // billing checks but still needs a thread the member can write to
  private async assertCanAnswerInChat({
    threadId,
    messageId,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    isStartingChatTurn,
  }: AnswerToolCallArgs & {
    messageId: string;
    isStartingChatTurn: boolean;
  }): Promise<void> {
    await this.assertHasSettingPermission({
      setting: PermissionFlagType.AI,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    if (isStartingChatTurn) {
      await this.turnPreflightService.assertCanStartChatTurn({
        threadId,
        modelId,
        userWorkspaceId,
        workspaceMemberId,
        workspace,
      });
    } else {
      await this.agentChatService.getWritableThread({
        threadId,
        workspaceMemberId,
        workspaceId: workspace.id,
      });
    }

    await this.actorService.authorizeToolCallResolution({
      workspaceId: workspace.id,
      threadId,
      messageId,
    });
  }

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

    let workflowRun: Pick<WorkflowRunWorkspaceEntity, 'id'> | null = null;

    try {
      workflowRun = await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            )
            .findOne({ where: { id: workflowRunId }, select: { id: true } }),
      );
    } catch (error) {
      if (!(error instanceof PermissionsException)) {
        throw error;
      }
    }

    if (!isDefined(workflowRun)) {
      throw new AiException(
        'The tool call to answer could not be found',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }
  }

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
      executeTool: async ({ toolName, args }) => {
        const authContext = workspaceAuthContextStorage.getStore();

        if (!isDefined(authContext) || !isUserAuthContext(authContext)) {
          throw new AiException(
            'Answering requires a signed-in person',
            AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
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

        return this.toolRegistryService.resolveAndExecute(toolName, args, {
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
        });
      },
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
      throw new AiException(
        `Answering this request requires the ${setting} permission`,
        AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
      );
    }
  }

  private notPending(): AiException {
    return new AiException(
      'This tool call is no longer waiting for an answer',
      AiExceptionCode.TOOL_CALL_NOT_PENDING,
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
