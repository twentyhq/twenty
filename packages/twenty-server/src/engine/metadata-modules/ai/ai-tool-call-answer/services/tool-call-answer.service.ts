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
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import { parsePausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/parse-pausing-tool-call.util';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { isToolOutputAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/is-tool-output-awaited-by-caller.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

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
  turnId: string;
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
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly threadService: AgentChatThreadService,
    private readonly actorService: AgentChatActorService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly agentRunService: AgentRunService,
    private readonly permissionsService: PermissionsService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly toolRegistryService: ToolRegistryService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  async answer(args: AnswerToolCallArgs): Promise<AnswerToolCallOutcome> {
    const { threadId, toolCallId, userWorkspaceId, workspace } = args;
    const workspaceId = workspace.id;

    const [thread, toolPart] = await Promise.all([
      this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
        select: ['id', 'activeStreamId', 'pendingQuestionMessageId'],
      }),
      this.conversationReaderService.findToolPart({
        threadId,
        toolCallId,
        workspaceId,
      }),
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

    // a caller such as a workflow step that waits on the call takes the answer instead of a chat turn.
    // An answer replaces that output, so a call no longer pending starts nothing and is refused below
    const isAwaitedByCaller = isToolOutputAwaitedByCaller(toolPart.toolOutput);
    const isToolCallPending =
      thread.pendingQuestionMessageId === toolPart.messageId &&
      isAwaitingPausingToolOutput(toolPart.toolOutput);

    await this.assertCanAnswerInChat({
      ...args,
      messageId: toolPart.messageId,
      isStartingChatTurn: !isAwaitedByCaller && isToolCallPending,
    });

    if (!isToolCallPending) {
      throw this.notPending();
    }

    const validation = pausingToolCall.validate(args.response);

    if (!validation.isValid) {
      throw new AiException(
        validation.errorMessage,
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

    await this.streamRecoveryService.reapDeadStream({
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

    let awaitingRun: AgentRunEntity | null = null;
    let isClaimedAsRunning = false;
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

      if (isAwaitedByCaller) {
        const waitingState =
          await this.agentRunService.findWaitingRun({
            workspaceId,
            threadId,
          });

        if (waitingState.status === 'NOT_READY') {
          throw new AiException(
            'The run waiting on this call is not ready for an answer yet',
            AiExceptionCode.TOOL_CALL_NOT_PENDING,
            {
              userFriendlyMessage: msg`This request is still getting ready. Try again in a moment.`,
            },
          );
        }

        if (waitingState.status === 'GONE') {
          // the run waiting on the call was dropped, as when it is released
          await this.threadLifecycleService.closePendingQuestion({
            workspaceId,
            threadId,
            messageId: toolPart.messageId,
            activeStreamId: streamId,
            turnStatus: AgentTurnStatus.CANCELLED,
          });

          await this.agentRunService.release({
            workspaceId,
            run: waitingState.run,
          });

          throw this.notPending();
        }

        awaitingRun = waitingState.run;
      }

      const runningToolResult = pausingToolCall.toRunningToolResult?.(
        validation.output,
      );

      if (isDefined(runningToolResult)) {
        if (
          !(await this.agentChatService.claimToolCallAnswer({
            partId: toolPart.id,
            toolOutput: runningToolResult,
            workspaceId,
          }))
        ) {
          throw this.notPending();
        }

        isClaimedAsRunning = true;
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
      // a call claimed as running cannot be answered again, so it closes as interrupted and the
      // run or turn fails, instead of leaving the call waiting on an outcome
      if (isClaimedAsRunning) {
        await this.threadLifecycleService
          .closePendingQuestion({
            workspaceId,
            threadId,
            messageId: toolPart.messageId,
            activeStreamId: streamId,
            turnStatus: AgentTurnStatus.COMPLETED,
          })
          .catch((closeError: unknown) =>
            this.logger.warn(
              `Could not close the interrupted call on thread ${threadId}: ${closeError instanceof Error ? closeError.message : String(closeError)}`,
            ),
          );

        await this.failAfterAnswer({
          threadId,
          workspaceId,
          streamId,
          awaitingRun,
          error,
        });
      } else {
        await this.streamRecoveryService.releaseStreamClaim({
          threadId,
          workspaceId,
          streamId,
        });
      }

      throw error;
    }

    // the answer is recorded and cannot be resubmitted, so failures fail the turn or run for retry
    try {
      const answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        turnStatus:
          isAwaitedByCaller || !isLastAnswer
            ? AgentTurnStatus.COMPLETED
            : AgentTurnStatus.RUNNING,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: answerText }],
        },
        workspaceId,
      });

      await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });

      // An answer is a message the member sent, so the chat moves up and
      // comes back to their inbox. The answer is already recorded and cannot
      // be given again, so a failure here must not fail the turn
      await this.threadService
        .notifyThreadActivityUpdated({
          threadId,
          workspaceMemberId: args.workspaceMemberId,
          workspaceId,
          text: answerText,
        })
        .catch((error: unknown) =>
          this.logger.warn(
            `Could not record answer activity on thread ${threadId}: ${formatErrorWithCause(error)}`,
          ),
        );

      // a suspended run continues in its own job, and only the last answer resumes a chat
      if (isAwaitedByCaller || !isLastAnswer) {
        await this.streamRecoveryService.releaseStreamClaim({
          threadId,
          workspaceId,
          streamId,
        });

        if (isLastAnswer && isDefined(awaitingRun)) {
          await this.agentRunService.deliverAnswer({
            workspaceId,
            run: awaitingRun,
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
        awaitingRun,
        error,
      });

      throw error;
    }
  }

  private async failAfterAnswer({
    threadId,
    workspaceId,
    streamId,
    awaitingRun,
    error,
  }: {
    threadId: string;
    workspaceId: string;
    streamId: string;
    awaitingRun: AgentRunEntity | null;
    error: unknown;
  }): Promise<void> {
    if (!isDefined(awaitingRun)) {
      await this.streamRecoveryService.failStream({
        threadId,
        workspaceId,
        streamId,
        error,
      });

      return;
    }

    await this.streamRecoveryService.releaseStreamClaim({
      threadId,
      workspaceId,
      streamId,
    });
    await this.agentRunService.settle({
      workspaceId,
      run: awaitingRun,
      outcome: {
        status: 'FAILED',
        error: 'The run could not resume after its question was answered',
      },
    });
  }

  // an answer a caller such as a workflow step waits on starts no chat turn, so it skips the
  // model and billing checks but still needs a thread the member can write to
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
      await this.threadService.getWritableThread({
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

  private buildCompletionContext({
    workspaceId,
    userWorkspaceId,
    threadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadId: string;
  }): PausingToolCompletionContext {
    let toolContext: Promise<ToolContext> | undefined;

    return {
      executeTool: async ({ toolName, args }) => {
        // an approved record call reads the record again before running, so both calls share one context
        toolContext ??= this.buildAnswerToolContext({
          workspaceId,
          userWorkspaceId,
          threadId,
        });

        return this.toolRegistryService.resolveAndExecute(
          toolName,
          args,
          await toolContext,
        );
      },
    };
  }

  private async buildAnswerToolContext({
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
      throw new AiException(
        'Answering requires a signed-in person',
        AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
      );
    }

    const rolePermissions = await this.actorService.resolveRolePermissions({
      workspaceId,
      userWorkspaceId,
      authContext,
    });

    if (!isDefined(rolePermissions)) {
      throw new AiException(
        'Answering requires a role in the workspace',
        AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
      );
    }

    const { actorContext, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspaceId,
      );

    return {
      workspaceId,
      ...rolePermissions,
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
