import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
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
import { buildWorkflowStepCaller } from 'src/modules/workflow/workflow-executor/utils/build-workflow-step-caller.util';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { type WorkflowAiAgentActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-input.type';
import { buildWorkflowAgentRunExecutionContext } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-execution-context.util';
import { buildWorkflowAgentRunSpec } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-spec.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';

// Starts the step's agent and hands it to the engine: an agent that pauses is continued by the
// engine, which calls the step back with its outcome
@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentRunnerService: AgentRunnerService,
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
    const {
      workspaceMemberId: recipientWorkspaceMemberId,
      conversation: conversationSettings,
    } = resolveInput(
      {
        workspaceMemberId: step.settings.input.workspaceMemberId,
        conversation: step.settings.input.conversation,
      },
      context,
    ) as Pick<WorkflowAiAgentActionInput, 'workspaceMemberId' | 'conversation'>;

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

    const conversation =
      await this.workflowAgentConversationService.openConversation({
        runInfo,
        stepId: currentStepId,
        title: step.name,
        recipientWorkspaceMemberId: isNonEmptyString(recipientWorkspaceMemberId)
          ? recipientWorkspaceMemberId
          : null,
        threadKey: resolveConversationThreadKey({
          conversation: conversationSettings,
          defaultScope: 'STEP',
          workflowRunId: runInfo.workflowRunId,
          stepExecutionKey: buildStepExecutionKey({
            stepId: currentStepId,
            steps,
            context,
          }),
        }),
      });

    const { threadId, outcome, summary } = await this.agentRunnerService.run({
      workspaceId,
      conversation,
      caller: buildWorkflowStepCaller({
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
      }),
      spec: buildWorkflowAgentRunSpec({
        step,
        isApplicationBound: isDefined(application),
      }),
      agent,
      prompt: (resolveInput(prompt, context) as string | undefined) ?? null,
      executionContext: buildWorkflowAgentRunExecutionContext(executionContext),
      resolveCreatedBy: () =>
        this.workflowAgentConversationService.findTurnCreatedBy(runInfo),
    });

    await this.workflowRunStepLogService.setAiAgentStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      summary,
      threadId,
    });

    switch (outcome.status) {
      case 'COMPLETED':
        return { result: outcome.result };
      case 'SUSPENDED':
        return { wait: { type: 'CALLBACK' } };
      case 'FAILED':
        return { error: outcome.error };
    }
  }
}
