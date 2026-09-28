import { Injectable, Logger } from '@nestjs/common';

import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/workflow-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { WORKFLOW_AGENT_ASK_QUESTIONS_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-ask-questions-prompt.constant';
import {
  type RecordedConversation,
  WorkflowAgentConversationWorkspaceService,
} from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { mergeAiAgentStepLogs } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/merge-ai-agent-step-logs.util';
import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(AiAgentWorkflowAction.name);

  constructor(
    private readonly aiAgentExecutionService: AgentAsyncExecutorService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
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

    const { agentId, prompt, canAskQuestions } = step.settings.input;
    const workspaceId = runInfo.workspaceId;

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

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const resolvedPrompt = resolveInput(prompt, context) as string;

    // A step that already holds a conversation before running is one whose
    // question has just been answered: fresh executions, loop iterations and
    // retries all start without one.
    const resumedThreadId = await this.findResumedThreadId({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
    });

    const recordConversation = (
      executionResult?: AgentExecutionResult,
    ): Promise<RecordedConversation | null> =>
      this.recordConversation({
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
        record: () =>
          isDefined(resumedThreadId)
            ? this.workflowAgentConversationService.recordContinuation({
                workspaceId,
                workflowRunId: runInfo.workflowRunId,
                stepId: currentStepId,
                threadId: resumedThreadId,
                agentId: agent?.id ?? null,
                executionResult,
              })
            : this.workflowAgentConversationService.recordExecution({
                workspaceId,
                workflowRunId: runInfo.workflowRunId,
                stepId: currentStepId,
                title: step.name,
                agentId: agent?.id ?? null,
                prompt: resolvedPrompt,
                initiatorUserWorkspaceId: userWorkspaceId,
                executionResult,
              }),
      });

    const startedAtMs = Date.now();

    const executionResult = await this.aiAgentExecutionService
      .executeAgent({
        agent,
        ...(isDefined(resumedThreadId)
          ? {
              messages: [],
              priorModelMessages:
                await this.workflowAgentConversationService.loadModelMessages({
                  workspaceId,
                  threadId: resumedThreadId,
                }),
            }
          : { messages: [{ role: 'user', content: resolvedPrompt }] }),
        baseSystemPrompt:
          canAskQuestions === true
            ? `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_ASK_QUESTIONS_PROMPT}`
            : WORKFLOW_BASE_SYSTEM_PROMPT,
        pausingTools:
          canAskQuestions === true
            ? {
                [ASK_QUESTIONS_TOOL_NAME]: createAskQuestionsTool({
                  isWorkspaceSetupThread: false,
                }),
              }
            : {},
        actorContext: executionContext.isActingOnBehalfOfUser
          ? executionContext.initiator
          : undefined,
        authContext: executionContext.authContext,
        workspaceId,
        userWorkspaceId,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      })
      .catch(async (error: unknown) => {
        await recordConversation();
        throw error;
      });

    const durationMs = Date.now() - startedAtMs;

    // A step that runs out of credits fails even if its agent asked something,
    // so its question must not be left open as though the run waited for it.
    const recordedConversation = await recordConversation(
      executionResult.hasNoMoreAvailableCredits
        ? { ...executionResult, isPaused: false }
        : executionResult,
    );

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      executionResult,
      durationMs,
      isResumed: isDefined(resumedThreadId),
    });

    if (executionResult.hasNoMoreAvailableCredits) {
      return {
        error: 'Agent stopped: no more available credits.',
      };
    }

    if (executionResult.isPaused === true) {
      // The conversation is where the question is answered, so without it the
      // run would wait for an answer nobody can give.
      if (recordedConversation?.isAwaitingAnswer !== true) {
        return {
          error: 'Agent asked a question that could not be recorded.',
        };
      }

      return { pendingEvent: true };
    }

    return {
      result: executionResult.result,
    };
  }

  private async findResumedThreadId({
    workflowRunId,
    workspaceId,
    stepId,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
  }): Promise<string | undefined> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    return workflowRun.state?.stepInfos?.[stepId]?.threadId;
  }

  // The conversation is a record of the step, not part of its outcome, so a
  // failure to write it must not fail a step whose agent did its work.
  private async recordConversation({
    workflowRunId,
    stepId,
    record,
  }: {
    workflowRunId: string;
    stepId: string;
    record: () => Promise<RecordedConversation | null>;
  }): Promise<RecordedConversation | null> {
    try {
      return await record();
    } catch (error) {
      this.logger.warn(
        `Failed to record the conversation for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    executionResult,
    durationMs,
    isResumed,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    executionResult: AgentExecutionResult;
    durationMs: number;
    isResumed: boolean;
  }): Promise<void> {
    const stepLog = buildAiAgentStepLog({ executionResult, durationMs });

    if (!stepLog) {
      return;
    }

    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: isResumed
          ? mergeAiAgentStepLogs({
              previousStepLog: await this.workflowRunStepLogService.getStepLog({
                workflowRunId,
                workspaceId,
                stepId,
              }),
              nextStepLog: stepLog,
            })
          : stepLog,
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
