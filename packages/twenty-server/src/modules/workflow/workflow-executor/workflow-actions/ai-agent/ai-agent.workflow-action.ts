import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/workflow-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentRunThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-run-thread.service';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(AiAgentWorkflowAction.name);

  constructor(
    private readonly aiAgentExecutionService: AgentAsyncExecutorService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly moduleRef: ModuleRef,
  ) {}

  // The chat module already reaches this action through the workflow runner,
  // so the conversation service is looked up at run time rather than imported
  // as a module dependency.
  private get agentRunThreadService(): AgentRunThreadService {
    return this.moduleRef.get(AgentRunThreadService, { strict: false });
  }

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
        'Step is not an AI Agent action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { agentId, prompt } = step.settings.input;
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

    // The run's conversation: created on the first execution of the step,
    // picked up again when the step resumes after a person answered.
    const existingThread = await this.agentRunThreadService.findRunThread({
      workflowRunId: runInfo.workflowRunId,
      workflowStepId: currentStepId,
      workspaceId,
    });

    const thread =
      existingThread ??
      (await this.agentRunThreadService.openRunThread({
        workflowRunId: runInfo.workflowRunId,
        workflowStepId: currentStepId,
        workspaceId,
        ownerUserWorkspaceId:
          await this.agentRunThreadService.resolveOwnerUserWorkspaceId({
            authContext: executionContext.authContext,
            initiatorWorkspaceMemberId:
              executionContext.initiator?.workspaceMemberId ?? null,
            workspaceId,
          }),
        title: await this.buildThreadTitle({
          workflowRunId: runInfo.workflowRunId,
          workspaceId,
          stepName: step.name,
        }),
        prompt: resolveInput(prompt, context) as string,
        agentId: agent?.id ?? null,
      }));

    const messages = await this.agentRunThreadService.loadTranscript({
      threadId: thread.id,
      workspaceId,
    });

    const startedAtMs = Date.now();

    const executionResult = await this.aiAgentExecutionService.executeAgent({
      agent,
      messages,
      baseSystemPrompt: WORKFLOW_BASE_SYSTEM_PROMPT,
      actorContext: executionContext.isActingOnBehalfOfUser
        ? executionContext.initiator
        : undefined,
      authContext: executionContext.authContext,
      workspaceId,
      userWorkspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      extraTools: {
        [ASK_QUESTIONS_TOOL_NAME]: createAskQuestionsTool({
          isWorkspaceSetupThread: false,
          isWorkflowRun: true,
        }),
      },
      pauseOnToolNames: [ASK_QUESTIONS_TOOL_NAME],
    });

    const durationMs = Date.now() - startedAtMs;

    const { pendingQuestions } =
      await this.agentRunThreadService.recordAssistantTurn({
        thread,
        executionResult,
        agentId: agent?.id ?? null,
      });

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      executionResult,
      durationMs,
    });

    if (executionResult.hasNoMoreAvailableCredits) {
      return {
        error: 'AI agent stopped: no more available credits.',
      };
    }

    // The agent asked a person something: the run waits on the answer.
    if (isDefined(pendingQuestions)) {
      return {
        pendingEvent: true,
      };
    }

    return {
      result: executionResult.result,
    };
  }

  private async buildThreadTitle({
    workflowRunId,
    workspaceId,
    stepName,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepName: string;
  }): Promise<string> {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    return isDefined(workflowRun?.name)
      ? `${workflowRun.name} · ${stepName}`
      : stepName;
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    executionResult,
    durationMs,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    executionResult: AgentExecutionResult;
    durationMs: number;
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
        stepLog,
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
