import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { generateId } from 'ai';
import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
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

// Every pause for a person is a pausing tool call in a conversation, a chat or
// a workflow run's, and each is answered here. An answer takes the
// conversation's stream claim, and only while the conversation still waits on
// the message that paused, so each call is answered once and only the last
// answer resumes what waits on them.
@Injectable()
export class ToolCallAnswerService {
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

    const { workflowRunId } = thread;

    if (isDefined(workflowRunId)) {
      await this.assertCanAnswerForWorkflowRun({
        userWorkspaceId,
        workspaceId,
        workflowRunId,
      });
    } else {
      await this.assertCanAnswerInChat({
        ...args,
        messageId: toolPart.messageId,
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
    let answerMessage: Awaited<ReturnType<AgentChatService['addMessage']>>;

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
        });

        if (!isDefined(step)) {
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

      await this.agentChatService.updateToolPartOutput({
        partId: toolPart.id,
        toolOutput: completion.toolResult,
        workspaceId,
      });

      answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: completion.answerText }],
        },
        workspaceId,
      });

      isLastAnswer = awaitingToolParts.length === 1;

      if (isLastAnswer) {
        await this.agentChatService.clearPendingToolCalls({
          threadId,
          messageId: toolPart.messageId,
          workspaceId,
        });
      }
    } catch (error) {
      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
      );

      throw error;
    }

    await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });

    // A run resumes in its own executor, and a conversation still waiting on
    // other calls resumes with the last of their answers.
    if (isDefined(step) || !isLastAnswer) {
      await this.agentChatStreamingService.releaseStreamClaim(
        threadId,
        workspaceId,
        streamId,
      );

      if (isLastAnswer && isDefined(workflowRunId) && isDefined(step)) {
        await this.resumeWorkflowRunStep({
          workspaceId,
          workflowRunId,
          step,
          threadId,
          response: validation.output,
        });
      }

      return { streamId: null, turnId: answerMessage.turnId };
    }

    try {
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
    } catch (error) {
      // The answer is recorded, so the turn fails and can be retried rather
      // than wait on an answer nobody can give again.
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

    return { streamId, turnId: answerMessage.turnId };
  }

  // Behind submitFormStep, kept for clients built before answerToolCall: a
  // form step's call is named after the step, in the step's conversation.
  async answerFormStep({
    workflowRunId,
    stepId,
    ...args
  }: Omit<AnswerToolCallArgs, 'threadId' | 'toolCallId' | 'modelId'> & {
    workflowRunId: string;
    stepId: string;
  }): Promise<void> {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId: args.workspace.id,
    });
    const threadId = workflowRun?.state?.stepInfos?.[stepId]?.threadId;

    if (!isDefined(threadId)) {
      throw this.notPending();
    }

    await this.answer({ ...args, threadId, toolCallId: stepId });
  }

  // Behind answerAgentChatQuestion, kept for clients built before
  // answerToolCall: a question is named by the message that asked it.
  async answerQuestionsOfMessage({
    messageId,
    ...args
  }: Omit<AnswerToolCallArgs, 'toolCallId'> & {
    messageId: string;
  }): Promise<AnswerToolCallOutcome> {
    const awaitingToolParts = await this.agentChatService.findAwaitingToolParts(
      { messageId, workspaceId: args.workspace.id },
    );
    const questionsPart = awaitingToolParts.find(
      (part) => part.toolName === ASK_QUESTIONS_TOOL_NAME,
    );

    if (!isDefined(questionsPart?.toolCallId)) {
      throw this.notPending();
    }

    return this.answer({ ...args, toolCallId: questionsPart.toolCallId });
  }

  // The answer is recorded and cannot be given again, so a resume that fails
  // fails the run, which can then be retried.
  private async resumeWorkflowRunStep({
    workspaceId,
    workflowRunId,
    step,
    threadId,
    response,
  }: {
    workspaceId: string;
    workflowRunId: string;
    step: WorkflowAction;
    threadId: string;
    response: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.workflowRunnerWorkspaceService.resumeAnsweredStep({
        workspaceId,
        workflowRunId,
        step,
        threadId,
        response,
      });
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'The run could not resume after its question was answered',
      });

      throw error;
    }
  }

  private async assertCanAnswerInChat({
    threadId,
    messageId,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
  }: AnswerToolCallArgs & { messageId: string }): Promise<void> {
    await this.assertHasSettingPermission({
      setting: PermissionFlagType.AI,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    await this.turnPreflightService.assertCanStartChatTurn({
      threadId,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    await this.actorService.authorizeToolCallResolution({
      workspaceId: workspace.id,
      threadId,
      messageId,
    });
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
