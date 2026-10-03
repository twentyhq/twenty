import { Injectable, Logger } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_EMAIL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, resolveInput } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { createProposeEmailTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-email.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
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

    // A record of the step, not its outcome, so a write failure must not fail the step
    const recordConversation = (
      executionResult: AgentExecutionResult,
    ): Promise<RecordedConversation | null> =>
      (isDefined(resumedThreadId)
        ? this.workflowAgentConversationService.recordContinuation({
            workspaceId,
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
          })
      ).catch((error: unknown) => {
        this.logger.warn(
          `Failed to record the conversation for workflowRun=${runInfo.workflowRunId} step=${currentStepId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        return null;
      });

    const isAskingQuestionsAllowed = canAskQuestions === true;

    const startedAtMs = Date.now();

    const executionResult = await this.aiAgentExecutionService.executeAgent({
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
      baseSystemPrompt: isAskingQuestionsAllowed
        ? `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_ASK_QUESTIONS_PROMPT}`
        : WORKFLOW_BASE_SYSTEM_PROMPT,
      pausingTools: isAskingQuestionsAllowed
        ? {
            [ASK_QUESTIONS_TOOL_NAME]: createAskQuestionsTool({
              isWorkspaceSetupThread: false,
            }),
            [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
            // propose_tool_call needs the agent's tools, which a step without an agent has none of
            ...(isDefined(agent)
              ? {}
              : { [PROPOSE_EMAIL_TOOL_NAME]: createProposeEmailTool() }),
          }
        : {},
      canProposeToolCalls: isAskingQuestionsAllowed,
      actorContext: executionContext.isActingOnBehalfOfUser
        ? executionContext.initiator
        : undefined,
      authContext: executionContext.authContext,
      workspaceId,
      userWorkspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    });

    const durationMs = Date.now() - startedAtMs;

    // Only executions that ask get a conversation, saving a thread per execution for looping agents
    const recordedConversation =
      isDefined(resumedThreadId) || executionResult.isPaused === true
        ? await recordConversation(executionResult)
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

    if (executionResult.isPaused === true) {
      // Without the conversation nobody could answer, so the run would wait forever
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

    if (!stepLog) {
      return;
    }

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
