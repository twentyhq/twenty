import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';
import {
  getWorkflowAiAgentStepConfigIssues,
  hasWorkflowAiAgentConversationConfig,
  isWorkflowAiAgentGenerateStep,
  WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { buildStartedAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-started-agent-run-summary.util';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
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
import { getWorkflowRunUserWorkspaceId } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/get-workflow-run-user-workspace-id.util';
import { buildWorkflowAgentRunSpec } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-spec.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';

// Starts the step's agent and hands it to the engine, which runs it on its own, continues it when it
// pauses and calls the step back with its outcome
@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentRunnerService: AgentRunnerService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    private readonly agentRunPersonaService: AgentRunPersonaService,
    private readonly conversationWriterService: AgentConversationWriterService,
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

    const { prompt } = step.settings.input;
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

    const [configIssue] = getWorkflowAiAgentStepConfigIssues({
      hasAgent: !isWorkflowAiAgentGenerateStep(step.settings.input),
      input: step.settings.input,
    });

    if (isDefined(configIssue)) {
      throw new WorkflowStepExecutorException(
        WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES[configIssue],
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const spec = buildWorkflowAgentRunSpec({
      step,
      isApplicationBound:
        isDefined(executionContext.application) &&
        !isWorkspaceCustomApplication({
          application: executionContext.application,
          workspaceCustomApplicationId:
            executionContext.authContext.workspace.workspaceCustomApplicationId,
        }),
      // a run without an application id belongs to the workspace custom application
      applicationId:
        executionContext.application?.id ??
        executionContext.authContext.workspace.workspaceCustomApplicationId,
    });

    const persona = await this.resolvePersonaOrThrow({ workspaceId, spec });

    this.workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow(
      {
        executionContext,
        targetApplicationId: persona.applicationId,
        targetLabel: `The agent of step "${step.name}"`,
      },
    );

    // only an agent step someone can take part in converses; any other step runs one-shot
    const hasConversation =
      !(await this.conversationWriterService.canInsertTurnWithoutThread(
        workspaceId,
      )) ||
      (!isWorkflowAiAgentGenerateStep(step.settings.input) &&
        hasWorkflowAiAgentConversationConfig(step.settings.input));
    const conversation = hasConversation
      ? await this.workflowAgentConversationService.openConversation({
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
        })
      : null;

    const resolvedPrompt = resolveInput(prompt, context) as string | undefined;

    // a conversation is linked from the start, so the run can be followed while it goes on
    await this.workflowRunStepLogService.setAiAgentStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      summary: buildStartedAgentRunSummary(persona.modelId),
      threadId: conversation?.threadId ?? null,
    });

    await this.agentRunnerService.start({
      workspaceId,
      conversation,
      caller: buildWorkflowStepCaller({
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
      }),
      spec,
      prompt: isDefined(resolvedPrompt)
        ? {
            messages: [{ role: 'user', content: resolvedPrompt }],
            senderUserWorkspaceId:
              getWorkflowRunUserWorkspaceId(executionContext),
            senderApplicationId: null,
          }
        : null,
    });

    return { wait: { type: 'CALLBACK' } };
  }

  private async resolvePersonaOrThrow({
    workspaceId,
    spec,
  }: {
    workspaceId: string;
    spec: AgentRunSpec;
  }): Promise<ResolvedAgentRunPersona> {
    try {
      return await this.agentRunPersonaService.resolveOrThrow({
        workspaceId,
        spec,
      });
    } catch (error) {
      if (
        error instanceof AiException &&
        (error.code === AiExceptionCode.AGENT_NOT_FOUND ||
          error.code === AiExceptionCode.AGENT_IS_INACTIVE)
      ) {
        throw new WorkflowStepExecutorException(
          error.message,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
          { userFriendlyMessage: error.userFriendlyMessage },
        );
      }

      throw error;
    }
  }
}
