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
import { parsePausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/parse-pausing-tool-call.util';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { readToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-tool-call-workflow-step.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
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
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly toolRegistryService: ToolRegistryService,
  ) {}

  async answer(args: AnswerToolCallArgs): Promise<AnswerToolCallOutcome> {
    const { threadId, toolCallId, userWorkspaceId, workspace } = args;
    const workspaceId = workspace.id;

    const [thread, toolPart] = await Promise.all([
      this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
        select: ['id', 'activeStreamId', 'pendingQuestionMessageId'],
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

    // a workflow step that posted the call waits on it, and the answer resumes that step
    const workflowStep = readToolCallWorkflowStep(toolPart.toolOutput);
    const workflowRunId = workflowStep?.workflowRunId ?? null;

    await this.assertCanAnswerInChat({
      ...args,
      messageId: toolPart.messageId,
      isStartingChatTurn: !isDefined(workflowStep),
    });

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

    let step: WorkflowAction | null = null;
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

      if (isDefined(workflowRunId)) {
        step = await this.workflowRunWorkspaceService.findStepAwaitingAnswer({
          threadId,
          workflowRunId,
          workspaceId,
          expectedStepId: workflowStep?.stepId,
        });

        if (
          !isDefined(step) &&
          (await this.workflowRunWorkspaceService.isStepStillRunning({
            stepId: workflowStep?.stepId,
            threadId,
            workflowRunId,
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
      // a call claimed as running cannot be answered again, so the run or turn fails, which
      // closes the call as interrupted instead of leaving it waiting on an outcome
      if (isClaimedAsRunning) {
        if (!isDefined(workflowRunId)) {
          await this.agentChatService
            .closePendingToolCalls({
              threadId,
              messageId: toolPart.messageId,
              workspaceId,
              where: { activeStreamId: streamId },
            })
            .catch((closeError: unknown) =>
              this.logger.warn(
                `Could not close the interrupted call on thread ${threadId}: ${closeError instanceof Error ? closeError.message : String(closeError)}`,
              ),
            );
        }

        await this.failAfterAnswer({
          threadId,
          workspaceId,
          streamId,
          workflowRunId,
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

      // runs resume in their own executor, and only the last answer resumes a chat
      if (isDefined(step) || !isLastAnswer) {
        await this.streamRecoveryService.releaseStreamClaim({
          threadId,
          workspaceId,
          streamId,
        });

        if (isLastAnswer && isDefined(workflowRunId) && isDefined(step)) {
          await this.workflowRunnerWorkspaceService.resumeAnsweredStep({
            workspaceId,
            workflowRunId,
            step,
            threadId,
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
    if (!isDefined(workflowRunId)) {
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
    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.FAILED,
      error: 'The run could not resume after its question was answered',
    });
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
