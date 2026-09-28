import { Injectable, Logger } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/workflow-base-system-prompt.const';
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
import { assertStepTargetBelongsToOwningApplication } from 'src/modules/workflow/workflow-executor/utils/assert-step-target-belongs-to-owning-application.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
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

    const { owningApplication } = executionContext;

    if (isDefined(agent)) {
      assertStepTargetBelongsToOwningApplication({
        owningApplication,
        targetApplicationId: agent.applicationId,
        targetLabel: `Agent "${agent.name}"`,
      });
    }

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const resolvedPrompt = resolveInput(prompt, context) as string;
    const recordConversation = (executionResult?: AgentExecutionResult) =>
      this.recordConversation({
        workspaceId,
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
        title: step.name,
        agentId: agent?.id ?? null,
        prompt: resolvedPrompt,
        initiatorUserWorkspaceId: userWorkspaceId,
        executionResult,
      });

    const startedAtMs = Date.now();

    const executionResult = await this.aiAgentExecutionService
      .executeAgent({
        agent,
        messages: [{ role: 'user', content: resolvedPrompt }],
        baseSystemPrompt: WORKFLOW_BASE_SYSTEM_PROMPT,
        actorContext: executionContext.isActingOnBehalfOfUser
          ? executionContext.initiator
          : undefined,
        authContext: executionContext.authContext,
        workspaceId,
        userWorkspaceId,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
        ...(isDefined(owningApplication)
          ? {
              executionRoleIds: getRoleIdsFromRolePermissionConfig(
                executionContext.rolePermissionConfig,
              ),
              requireConnectedAccountUsableByCaller: true,
            }
          : {}),
      })
      .catch(async (error: unknown) => {
        await recordConversation();
        throw error;
      });

    const durationMs = Date.now() - startedAtMs;

    await recordConversation(executionResult);

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      executionResult,
      durationMs,
    });

    if (executionResult.hasNoMoreAvailableCredits) {
      return {
        error: 'Agent stopped: no more available credits.',
      };
    }

    return {
      result: executionResult.result,
    };
  }

  // The conversation is a record of the step, not part of its outcome, so a
  // failure to write it must not fail a step whose agent did its work.
  private async recordConversation(
    args: Parameters<
      WorkflowAgentConversationWorkspaceService['recordExecution']
    >[0],
  ): Promise<void> {
    try {
      await this.workflowAgentConversationService.recordExecution(args);
    } catch (error) {
      this.logger.warn(
        `Failed to record the conversation for workflowRun=${args.workflowRunId} step=${args.stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
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
