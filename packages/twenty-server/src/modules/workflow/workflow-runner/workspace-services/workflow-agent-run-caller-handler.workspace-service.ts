import { Injectable, type OnModuleInit } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { buildWorkflowAgentRunExecutionContext } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-execution-context.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { buildSendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/build-send-chat-message-answer-result.util';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

type WorkflowStepCallerInput = Parameters<
  AgentRunCallerHandler['getWaitingState']
>[0];

// A step waiting on a CALLBACK takes the outcome of what it handed its work to: the agent run the
// engine continued, or the answer to a call the step posted itself
@Injectable()
export class WorkflowAgentRunCallerHandlerWorkspaceService
  implements AgentRunCallerHandler, OnModuleInit
{
  readonly callerType = 'WORKFLOW_STEP';

  constructor(
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register(this);
  }

  async buildExecutionContext({
    workspaceId,
    caller,
  }: WorkflowStepCallerInput): Promise<AgentRunExecutionContext> {
    return buildWorkflowAgentRunExecutionContext(
      await this.workflowExecutionContextService.getExecutionContext({
        workflowRunId: caller.ref.workflowRunId,
        workspaceId,
      }),
    );
  }

  async resolveTurnAuthor({
    workspaceId,
    caller,
  }: WorkflowStepCallerInput): Promise<ActorMetadata> {
    return this.workflowAgentConversationService.findTurnCreatedBy({
      workflowRunId: caller.ref.workflowRunId,
      workspaceId,
    });
  }

  // a step handing its work off still runs until the executor marks it pending, and an outcome may come first
  async getWaitingState({
    workspaceId,
    caller,
  }: WorkflowStepCallerInput): Promise<AgentRunCallerWaitingState> {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId: caller.ref.workflowRunId,
      workspaceId,
    });
    const stepInfo = workflowRun?.state?.stepInfos?.[caller.ref.stepId];

    if (workflowRun?.status !== WorkflowRunStatus.RUNNING) {
      return 'GONE';
    }

    if (stepInfo?.status === StepStatus.RUNNING) {
      return 'NOT_READY';
    }

    return stepInfo?.status === StepStatus.PENDING && !isDefined(stepInfo.error)
      ? 'WAITING'
      : 'GONE';
  }

  // The run job ends the step with the outcome through the executor's usual path, so a failure is
  // retried or continues on failure like any failed step
  async onOutcome({
    workspaceId,
    caller: {
      ref: { workflowRunId, stepId },
    },
    threadId,
    outcome,
    summary,
  }: Parameters<AgentRunCallerHandler['onOutcome']>[0]): Promise<void> {
    if (isDefined(summary)) {
      await this.workflowRunStepLogService.setAiAgentStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        summary,
        threadId,
      });
    }

    const actionOutput =
      outcome.status === 'FAILED'
        ? { error: outcome.error }
        : {
            result: await this.buildStepResult({
              workspaceId,
              workflowRunId,
              stepId,
              threadId,
              result: outcome.result,
            }),
          };

    // the step stays pending until the job claims it, so the run must not stay running without one
    try {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId,
          workflowRunId,
          awaitedStepOutput: { stepId, actionOutput },
        },
        buildRunWorkflowJobOptions(workflowRunId),
      );
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'The run could not resume after its step was handed its outcome',
      });

      throw error;
    }
  }

  // the member's answer already ran the call, so a Send Message step only reports it
  private async buildStepResult({
    workspaceId,
    workflowRunId,
    stepId,
    threadId,
    result,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    threadId: string;
    result: object;
  }): Promise<object> {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });
    const step = workflowRun?.state?.flow?.steps?.find(
      (candidateStep) => candidateStep.id === stepId,
    );

    return isDefined(step) && isWorkflowSendChatMessageAction(step)
      ? buildSendChatMessageAnswerResult({
          threadId,
          toolResult: result as Record<string, unknown>,
        })
      : result;
  }
}
