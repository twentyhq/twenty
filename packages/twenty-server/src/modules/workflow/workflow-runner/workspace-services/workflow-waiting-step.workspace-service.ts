import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { z } from 'zod';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type OwnerWaitingState } from 'src/engine/core-modules/pending-wake-up/types/owner-waiting-state.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { buildWorkflowStepCaller } from 'src/modules/workflow/workflow-executor/utils/build-workflow-step-caller.util';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { buildWorkflowAgentRunExecutionContext } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-execution-context.util';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { isWorkflowRunNotFoundError } from 'src/modules/workflow/workflow-runner/utils/is-workflow-run-not-found-error.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';

const workflowStepCallerRefSchema = z.object({
  workflowRunId: z.string(),
  stepId: z.string(),
});

// A pending step waits either on a CALLBACK, as the caller of an agent run the engine continued,
// or on a TIME, EVENT or ANSWER, as the owner of a wake-up keyed by its run and step. Both resume the run
@Injectable()
export class WorkflowWaitingStepWorkspaceService
  implements
    AgentRunCallerHandler,
    PendingWakeUpOwnerHandler<null>,
    OnModuleInit
{
  constructor(
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register('WORKFLOW_STEP', this);
    this.pendingWakeUpOwnerHandlerRegistryService.register(
      'WORKFLOW_STEP',
      this,
    );
  }

  async buildExecutionContext({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<AgentRunExecutionContext> {
    const { workflowRunId } = workflowStepCallerRefSchema.parse(caller.ref);
    const runInfo = { workflowRunId, workspaceId };

    return buildWorkflowAgentRunExecutionContext({
      executionContext:
        await this.workflowExecutionContextService.getExecutionContext(runInfo),
      turnCreatedBy:
        await this.workflowAgentConversationService.findTurnCreatedBy(runInfo),
    });
  }

  // A step still runs until the executor marks it pending, so an outcome can arrive before it waits.
  // A pending step with an error waits on a retry, not on what it handed its work to
  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<OwnerWaitingState> {
    const { workflowRunId, stepId } = workflowStepCallerRefSchema.parse(
      caller.ref,
    );
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });
    const stepInfo = workflowRun?.state?.stepInfos?.[stepId];

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
    caller,
    threadId,
    outcome,
    summary,
  }: Parameters<
    NonNullable<AgentRunCallerHandler['onOutcome']>
  >[0]): Promise<void> {
    const { workflowRunId, stepId } = workflowStepCallerRefSchema.parse(
      caller.ref,
    );

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
        : { result: outcome.result };

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

  buildResumeJobOptions(workflowRunId: string): QueueJobOptions {
    return buildRunWorkflowJobOptions(workflowRunId);
  }

  // the wake-up's own run and step are all the step needs to resume
  async getOwnerState({
    workspaceId,
    ownerId: workflowRunId,
    ownerKey: stepId,
  }: PendingWakeUpEntity): Promise<PendingWakeUpOwnerState<null>> {
    const status = await this.getWaitingState({
      workspaceId,
      caller: buildWorkflowStepCaller({ workflowRunId, stepId }),
    });

    return status === 'NOT_READY' ? { status } : { status, owner: null };
  }

  async getReadPermissions({ wakeUp }: { wakeUp: PendingWakeUpEntity }) {
    return this.workflowExecutionContextService.getExecutionContext({
      workflowRunId: wakeUp.ownerId,
      workspaceId: wakeUp.workspaceId,
    });
  }

  async resolve({
    wakeUp,
    outcome,
    isOwnerGone,
  }: {
    wakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    isOwnerGone: boolean;
  }): Promise<void> {
    const { workspaceId, ownerId: workflowRunId, ownerKey: stepId } = wakeUp;

    if (
      !isDefined(
        await this.pendingWakeUpService.claim({
          workspaceId,
          wakeUpId: wakeUp.id,
        }),
      ) ||
      isOwnerGone
    ) {
      return;
    }

    // the claimed wait is gone, so a step that cannot resume would wait forever
    try {
      // an answered call ends the step through the executor's usual path, so a failure is retried
      // or continues on failure like any failed step
      if (outcome.type === 'ANSWERED') {
        await this.messageQueueService.add<RunWorkflowJobData>(
          RUN_WORKFLOW_JOB_NAME,
          {
            workspaceId,
            workflowRunId,
            awaitedStepOutput: { stepId, actionOutput: outcome.answer },
          },
          buildRunWorkflowJobOptions(workflowRunId),
        );

        return;
      }

      const hasCompletedStep =
        await this.workflowRunWorkspaceService.updateStepInfoIfPending({
          stepId,
          stepInfo: {
            status: StepStatus.SUCCESS,
            result: buildDefaultWaitResult(outcome),
          },
          workflowRunId,
          workspaceId,
        });

      if (hasCompletedStep) {
        await this.messageQueueService.add<RunWorkflowJobData>(
          RUN_WORKFLOW_JOB_NAME,
          { workspaceId, workflowRunId, lastExecutedStepId: stepId },
          buildRunWorkflowJobOptions(workflowRunId),
        );
      }
    } catch (error) {
      if (isWorkflowRunNotFoundError(error)) {
        return;
      }

      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: `A waiting step could not resume: ${error instanceof Error ? error.message : String(error)}`,
        isSystemError: true,
      });

      throw error;
    }
  }
}
