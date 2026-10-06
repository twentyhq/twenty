import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';

import {
  ASK_QUESTION_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
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
import { buildWorkflowStepCaller } from 'src/modules/workflow/workflow-executor/utils/build-workflow-step-caller.util';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';
import { APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/application-bound-agent-excluded-tool-names.constant';
import { WORKFLOW_AGENT_WAIT_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-prompt.constant';
import { WORKFLOW_AGENT_WAIT_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';
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
    private readonly agentRunnerService: AgentRunnerService,
    private readonly agentCallerConversationService: AgentCallerConversationService,
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

    const { agentId, prompt, humanInputInstructions } = step.settings.input;
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

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const resolvedPrompt = resolveInput(prompt, context) as string | undefined;

    // a resumed step continues where it paused, any other opens the conversation its key names
    const conversation = isDefined(resumedThreadId)
      ? { threadId: resumedThreadId, isCreated: false }
      : await this.workflowAgentConversationService.openConversation({
          runInfo,
          stepId: currentStepId,
          title: step.name,
          recipientWorkspaceMemberId: isNonEmptyString(
            recipientWorkspaceMemberId,
          )
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

    const trimmedHumanInputInstructions = humanInputInstructions?.trim();
    const canAskForHumanInput = isNonEmptyString(trimmedHumanInputInstructions);

    // a resumed run continues from its answer, which is already the last message
    const messages =
      isDefined(resumedThreadId) || !isDefined(resolvedPrompt)
        ? []
        : [{ role: 'user' as const, content: resolvedPrompt }];

    const { outcome, summary } = await this.agentRunnerService.run({
      workspaceId,
      conversation,
      caller: buildWorkflowStepCaller({
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
      }),
      turn: {
        title: step.name,
        senderUserWorkspaceId: userWorkspaceId,
        senderApplicationId: null,
        messages,
        resolveCreatedBy: () =>
          this.workflowAgentConversationService.findTurnCreatedBy(runInfo),
      },
      execution: {
        agent,
        messages,
        baseSystemPrompt: canAskForHumanInput
          ? `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_WAIT_PROMPT}\n\n${WORKFLOW_AGENT_HUMAN_INPUT_PROMPT}\n\n${trimmedHumanInputInstructions}`
          : `${WORKFLOW_BASE_SYSTEM_PROMPT}\n\n${WORKFLOW_AGENT_WAIT_PROMPT}`,
        pausingTools: {
          ...createWorkflowAgentWaitTools(),
          ...(canAskForHumanInput
            ? {
                [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool({
                  isWorkspaceSetupThread: false,
                }),
                [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
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
      },
    });

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      summary,
      previousStepLog,
    });

    switch (outcome.status) {
      case 'NO_CREDITS':
        return {
          error: 'Agent stopped: no more available credits.',
        };
      case 'AWAITING_ANSWER':
        return { wait: { type: 'ANSWER' } };
      case 'PAUSED': {
        const wait = findAgentStepWait(outcome.pausedToolResults);

        // Resuming continues the conversation, so without it the run would wait forever
        if (isDefined(wait) && outcome.isResumable) {
          return { wait };
        }

        return {
          error: isDefined(wait)
            ? 'Agent paused to wait but its conversation could not be recorded.'
            : 'Agent asked a question that could not be recorded.',
        };
      }
      case 'COMPLETED':
        return { result: outcome.result };
    }
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

    await this.agentCallerConversationService.recordWaitOutcome({
      workspaceId: runInfo.workspaceId,
      threadId,
      caller: buildWorkflowStepCaller({
        workflowRunId: runInfo.workflowRunId,
        stepId: step.id,
      }),
      toolNames: WORKFLOW_AGENT_WAIT_TOOL_NAMES,
      toolOutput: buildWaitOutcomeToolOutput(outcome),
    });

    return { resumedThreadId: threadId };
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    summary,
    previousStepLog,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    summary: AgentRunSummary;
    previousStepLog?: WorkflowRunStepLog;
  }): Promise<void> {
    const stepLog = buildAiAgentStepLog(summary);

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
