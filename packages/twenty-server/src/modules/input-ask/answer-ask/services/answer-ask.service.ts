import { Injectable } from '@nestjs/common';

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
import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { parsePausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/parse-pausing-tool-call.util';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
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
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunChangeAuthorizationWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-change-authorization.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
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

type ToolCallToAnswer = AnswerAskArgs & {
  threadId: string;
  toolCallId: string;
  toolPart: NonNullable<Awaited<ReturnType<AgentChatService['findToolPart']>>>;
  pausingToolCall: PausingToolCall;
  output: Record<string, unknown>;
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
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly toolRegistryService: ToolRegistryService,
    private readonly workflowRunChangeAuthorizationWorkspaceService: WorkflowRunChangeAuthorizationWorkspaceService,
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
      const { threadId, toolCallId, workflowRunId } = inputAsk;
      const toolPart = await this.agentChatService.findToolPart({
        threadId,
        toolCallId,
        workspaceId,
      });
      const pausingToolCall = parsePausingToolCall(toolPart);

      if (!isDefined(toolPart) || !isDefined(pausingToolCall)) {
        throw new InputAskException(
          'The tool call this Ask waits on could not be found',
          InputAskExceptionCode.ASK_NOT_FOUND,
        );
      }

      const validation = pausingToolCall.validate(args.response);

      if (!validation.isValid) {
        throw new InputAskException(
          validation.errorMessage,
          InputAskExceptionCode.INVALID_ASK_RESPONSE,
        );
      }

      const toolCallToAnswer: ToolCallToAnswer = {
        ...args,
        threadId,
        toolCallId,
        toolPart,
        pausingToolCall,
        output: validation.output,
      };

      if (isDefined(workflowRunId)) {
        await this.answerWorkflowRunToolCall({
          ...toolCallToAnswer,
          workflowRunId,
        });

        return NO_STREAM;
      }

      return this.answerChatToolCall(toolCallToAnswer);
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

  // Behind submitFormStep, kept for clients built before answerAsk: the
  // form step's Ask is answered as if it had been named.
  async answerFormStepByStep({
    workflowRunId,
    stepId,
    ...args
  }: Omit<AnswerAskArgs, 'askId' | 'modelId'> & {
    workflowRunId: string;
    stepId: string;
  }): Promise<void> {
    const inputAsk = await this.inputAskWorkspaceService.findPendingForStep({
      workspaceId: args.workspace.id,
      workflowRunId,
      stepId,
    });

    if (!isDefined(inputAsk)) {
      throw this.notPending();
    }

    await this.answer({ ...args, askId: inputAsk.id });
  }

  // Behind answerAgentChatQuestion, kept for clients built before answerAsk:
  // a question is named by the message that asked it rather than by its Ask.
  async answerQuestionsOfMessage({
    threadId,
    messageId,
    ...args
  }: Omit<AnswerAskArgs, 'askId'> & {
    threadId: string;
    messageId: string;
  }): Promise<AnswerAskOutcome> {
    const workspaceId = args.workspace.id;
    const pendingInputAsks =
      await this.inputAskWorkspaceService.findPendingForThread({
        workspaceId,
        threadId,
      });

    for (const { id, toolCallId } of pendingInputAsks) {
      if (!isDefined(toolCallId)) {
        continue;
      }

      const toolPart = await this.agentChatService.findToolPart({
        threadId,
        toolCallId,
        workspaceId,
      });

      if (
        toolPart?.messageId === messageId &&
        toolPart.toolName === ASK_QUESTIONS_TOOL_NAME
      ) {
        return this.answer({ ...args, askId: id });
      }
    }

    throw this.notPending();
  }

  private async answerFormStep({
    response,
    userWorkspaceId,
    workspaceMemberId,
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
      workspaceMemberId,
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
  }: ToolCallToAnswer): Promise<AnswerAskOutcome> {
    const workspaceId = workspace.id;

    await this.assertHasSettingPermission({
      setting: PermissionFlagType.AI,
      userWorkspaceId,
      workspaceId,
    });

    const thread = await this.turnPreflightService.assertCanStartChatTurn({
      threadId,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
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

    let hasAnswered = false;

    try {
      hasAnswered = await this.inputAskWorkspaceService.answer({
        workspaceId,
        key: { threadId, toolCallId },
        response: output,
      });
    } finally {
      if (!hasAnswered) {
        await this.agentChatStreamingService.releaseStreamClaim(
          threadId,
          workspaceId,
          streamId,
        );
      }
    }

    if (!hasAnswered) {
      throw this.notPending();
    }

    let turnId: string | null;
    let hasOtherPendingAsks = false;

    // The answer is already recorded, so a failure from here on leaves a
    // failed turn to retry rather than an answer that can be given twice.
    try {
      const completion = await pausingToolCall.complete({
        output,
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

      // The agent continues once every call it paused on is answered. Each
      // answer holds the stream claim until here, so exactly one of them,
      // the last, finds none left.
      hasOtherPendingAsks =
        await this.inputAskWorkspaceService.hasPendingForThread({
          threadId,
          workspaceId,
        });

      if (hasOtherPendingAsks) {
        await this.agentChatStreamingService.releaseStreamClaim(
          threadId,
          workspaceId,
          streamId,
        );
      } else {
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
      }
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

    return {
      streamId: hasOtherPendingAsks ? null : streamId,
      threadId,
      turnId,
    };
  }

  private async answerWorkflowRunToolCall({
    threadId,
    toolCallId,
    toolPart,
    pausingToolCall,
    output,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    workflowRunId,
  }: ToolCallToAnswer & { workflowRunId: string }): Promise<void> {
    const workspaceId = workspace.id;

    await this.assertCanAnswerForWorkflowRun({
      userWorkspaceId,
      workspaceMemberId,
      workspaceId,
      workflowRunId,
    });

    // The answer resumes the agent step that asked, not the steps after it:
    // the agent continues its conversation with the answer as the last message.
    const claim =
      await this.workflowRunWorkspaceService.resolveStepAwaitingToolCall({
        threadId,
        toolCallId,
        response: output,
        workflowRunId,
        workspaceId,
      });

    if (claim.status !== 'RESOLVED') {
      throw this.notPending();
    }

    // The Ask is answered and cannot be answered again, so a completion or a
    // resume that fails fails the run, which can then be retried, rather than
    // leaving it waiting on an answer nobody can give anymore.
    try {
      const completion = await pausingToolCall.complete({
        output,
        context: this.buildCompletionContext({
          workspaceId,
          userWorkspaceId,
          threadId,
        }),
      });

      await this.workflowRunnerWorkspaceService.resumeAnsweredAgentStep({
        workspaceId,
        workflowRunId,
        stepId: claim.stepId,
        threadId,
        toolPart,
        toolResult: completion.toolResult,
        answerText: completion.answerText,
        senderUserWorkspaceId: userWorkspaceId,
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

    await this.publishToolCallResolved({ threadId, toolCallId, workspaceId });
  }

  // The same permission that lets someone run a workflow, on a run they can
  // read.
  private async assertCanAnswerForWorkflowRun({
    userWorkspaceId,
    workspaceMemberId,
    workspaceId,
    workflowRunId,
  }: {
    userWorkspaceId: string;
    workspaceMemberId: string;
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
      throw new InputAskException(
        'Ask not found',
        InputAskExceptionCode.ASK_NOT_FOUND,
      );
    }

    await this.workflowRunChangeAuthorizationWorkspaceService.assertMemberCanChangeRunOrThrow(
      {
        runInfo: { workflowRunId, workspaceId },
        workspaceMemberId,
        callerApplicationId: this.getCallerApplicationId(),
      },
    );
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
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting,
        applicationId: this.getCallerApplicationId(),
      });

    if (!hasPermission) {
      throw new InputAskException(
        `Answering this Ask requires the ${setting} permission`,
        InputAskExceptionCode.ASK_ANSWER_FORBIDDEN,
      );
    }
  }

  private getCallerApplicationId(): string | undefined {
    const requestAuthContext = workspaceAuthContextStorage.getStore();

    return isDefined(requestAuthContext) &&
      isUserAuthContext(requestAuthContext)
      ? requestAuthContext.application?.id
      : undefined;
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
