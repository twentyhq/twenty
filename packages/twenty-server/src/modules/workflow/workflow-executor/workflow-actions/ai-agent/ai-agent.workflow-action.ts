import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';

import {
  ASK_QUESTION_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { ASK_QUESTION_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { REQUEST_FORM_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/workflow-base-system-prompt.const';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';
import { APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/application-bound-agent-excluded-tool-names.constant';
import { WORKFLOW_AGENT_WAIT_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-prompt.constant';
import { createWorkflowAgentWaitTools } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/create-workflow-agent-wait-tools.util';
import { buildWaitOutcomeToolOutput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-wait-outcome-tool-output.util';
import { findAgentStepWait } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/find-agent-step-wait.util';
import { type WorkflowWaitResolution } from 'src/modules/workflow/workflow-wait/types/workflow-wait-resolution.type';
import { type WorkflowWaitResolutionInput } from 'src/modules/workflow/workflow-wait/types/workflow-wait-resolution-input.type';
import { WORKFLOW_AGENT_HUMAN_INPUT_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-human-input-prompt.constant';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { type WorkflowAiAgentActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-input.type';
import { mergeAiAgentStepLogs } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/merge-ai-agent-step-logs.util';
import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(AiAgentWorkflowAction.name);

  constructor(
    private readonly aiAgentExecutionService: AgentAsyncExecutorService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    private readonly conversationReaderService: AgentConversationReaderService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
    resumedThreadId,
    previousStepLog,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowAiAgentAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an Agent action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { agentId, prompt, humanInputInstructions } = step.settings.input;
    const workspaceId = runInfo.workspaceId;
    const workflowStep = {
      workflowRunId: runInfo.workflowRunId,
      stepId: currentStepId,
    };
    const { workspaceMemberId: recipientWorkspaceMemberId, conversation } =
      resolveInput(
        {
          workspaceMemberId: step.settings.input.workspaceMemberId,
          conversation: step.settings.input.conversation,
        },
        context,
      ) as Pick<
        WorkflowAiAgentActionInput,
        'workspaceMemberId' | 'conversation'
      >;

    // a variable can resolve to any value, so anything but a member id or nothing is refused
    if (
      isDefined(recipientWorkspaceMemberId) &&
      recipientWorkspaceMemberId !== '' &&
      !(
        isString(recipientWorkspaceMemberId) &&
        isValidUuid(recipientWorkspaceMemberId)
      )
    ) {
      throw new WorkflowStepExecutorException(
        'Recipient must be a workspace member',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    let agent: AgentEntity | null = null;

    if (agentId) {
      agent = await this.agentRepository.findOne(workspaceId, {
        where: { id: agentId },
      });
    }

    if (agentId && !agent) {
      throw new WorkflowStepExecutorException(
        `Agent with id ${agentId} not found`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const { application } = executionContext;

    if (isDefined(agent)) {
      await this.workflowExecutionContextService.assertStepTargetBelongsToRunApplicationOrThrow(
        {
          application,
          workspaceId,
          targetApplicationId: agent.applicationId,
          targetLabel: `Agent "${agent.name}"`,
        },
      );
    }

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const resolvedPrompt = resolveInput(prompt, context) as string;

    // a resumed step continues where it paused, any other opens the conversation its key names
    const conversationThread = isDefined(resumedThreadId)
      ? {
          threadId: resumedThreadId,
          isResumed: true,
          priorMessages: await this.conversationReaderService.loadMessages({
            workspaceId,
            threadId: resumedThreadId,
          }),
        }
      : {
          ...(await this.workflowAgentConversationService.openConversation({
            runInfo,
            stepId: currentStepId,
            title: step.name,
            recipientWorkspaceMemberId: isNonEmptyString(
              recipientWorkspaceMemberId,
            )
              ? recipientWorkspaceMemberId
              : null,
            threadKey: resolveConversationThreadKey({
              conversation,
              defaultScope: 'STEP',
              workflowRunId: runInfo.workflowRunId,
              stepExecutionKey: buildStepExecutionKey({
                stepId: currentStepId,
                steps,
                context,
              }),
            }),
          })),
          isResumed: false,
        };

    // A record of the step, not its outcome, so a write failure must not fail the step
    const recordConversation = async <TResult>(
      record: () => Promise<TResult>,
    ): Promise<TResult | null> => {
      try {
        return await record();
      } catch (error) {
        this.logger.warn(
          `Failed to record the conversation for workflowRun=${runInfo.workflowRunId} step=${currentStepId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        return null;
      }
    };

    const turnId = await recordConversation(() =>
      this.workflowAgentConversationService.openTurn({
        runInfo,
        threadId: conversationThread.threadId,
        agentId: agent?.id ?? null,
        prompt: conversationThread.isResumed ? null : resolvedPrompt,
        initiatorUserWorkspaceId: userWorkspaceId,
      }),
    );

    const trimmedHumanInputInstructions = humanInputInstructions?.trim();
    const canAskForHumanInput = isNonEmptyString(trimmedHumanInputInstructions);

    const startedAtMs = Date.now();

    let executionResult: AgentExecutionResult;

    try {
      executionResult = await this.aiAgentExecutionService.executeAgent({
        agent,
        messages: conversationThread.isResumed
          ? []
          : [{ role: 'user', content: resolvedPrompt }],
        priorMessages: conversationThread.priorMessages,
        baseSystemPrompt: canAskForHumanInput
          ? `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_WAIT_PROMPT}\n\n${WORKFLOW_AGENT_HUMAN_INPUT_PROMPT}\n\n${trimmedHumanInputInstructions}`
          : `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_WAIT_PROMPT}`,
        pausingTools: {
          ...createWorkflowAgentWaitTools(),
          ...(canAskForHumanInput
            ? {
                [ASK_QUESTION_TOOL_NAME]: ASK_QUESTION_PAUSING_TOOL.buildTool(),
                [REQUEST_FORM_TOOL_NAME]: REQUEST_FORM_PAUSING_TOOL.buildTool(),
              }
            : {}),
        },
        canProposeToolCalls: canAskForHumanInput,
        actorContext: executionContext.isActingOnBehalfOfUser
          ? executionContext.initiator
          : undefined,
        authContext: executionContext.authContext,
        workspaceId,
        userWorkspaceId,
        ...(isDefined(application)
          ? {
              additionalRoleRestrictionIds: getRoleIdsFromRolePermissionConfig(
                executionContext.rolePermissionConfig,
              ),
              additionalExcludedToolNames:
                APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES,
            }
          : {}),
      });
    } catch (error) {
      if (isDefined(turnId)) {
        await recordConversation(() =>
          this.workflowAgentConversationService.failTurn({
            workspaceId,
            turnId,
            error,
          }),
        );
      }

      throw error;
    }

    const durationMs = Date.now() - startedAtMs;

    const recordedConversation = isDefined(turnId)
      ? await recordConversation(() =>
          this.workflowAgentConversationService.closeTurn({
            workspaceId,
            threadId: conversationThread.threadId,
            turnId,
            workflowStep,
            title: step.name,
            agentId: agent?.id ?? null,
            executionResult,
          }),
        )
      : null;

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      executionResult,
      durationMs,
      previousStepLog,
    });

    if (executionResult.hasNoMoreAvailableCredits) {
      return {
        error: 'Agent stopped: no more available credits.',
      };
    }

    if (executionResult.isPaused) {
      if (recordedConversation?.isAwaitingAnswer) {
        return { wait: { type: 'ANSWER' } };
      }

      const wait = findAgentStepWait(executionResult.steps);

      // Resuming continues the conversation, so without it the run would wait forever
      if (isDefined(wait) && isDefined(recordedConversation)) {
        return { wait };
      }

      return {
        error: isDefined(wait)
          ? 'Agent paused to wait but its conversation could not be recorded.'
          : 'Agent asked a question that could not be recorded.',
      };
    }

    return {
      result: executionResult.result,
    };
  }

  async resolveWait({
    step,
    stepInfo,
    outcome,
    runInfo,
  }: WorkflowWaitResolutionInput): Promise<WorkflowWaitResolution> {
    const threadId = stepInfo.threadId;

    if (!isDefined(threadId)) {
      throw new WorkflowStepExecutorException(
        'A waiting agent step has no conversation to continue',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    await this.workflowAgentConversationService.recordWaitOutcome({
      workspaceId: runInfo.workspaceId,
      threadId,
      workflowStep: {
        workflowRunId: runInfo.workflowRunId,
        stepId: step.id,
      },
      toolOutput: buildWaitOutcomeToolOutput(outcome),
    });

    return { resumedThreadId: threadId };
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    executionResult,
    durationMs,
    previousStepLog,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    executionResult: AgentExecutionResult;
    durationMs: number;
    previousStepLog?: WorkflowRunStepLog;
  }): Promise<void> {
    const stepLog = buildAiAgentStepLog({ executionResult, durationMs });

    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: mergeAiAgentStepLogs({
          previousStepLog,
          nextStepLog: stepLog,
        }),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist step log for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
