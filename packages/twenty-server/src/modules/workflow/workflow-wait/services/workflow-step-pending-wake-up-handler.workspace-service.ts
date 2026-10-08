import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { getWorkflowStepWaitingState } from 'src/modules/workflow/workflow-runner/utils/get-workflow-step-waiting-state.util';
import { isWorkflowRunNotFoundError } from 'src/modules/workflow/workflow-runner/utils/is-workflow-run-not-found-error.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';

// A WORKFLOW_STEP wake-up is owned by a workflow run and keyed by the step that waits
@Injectable()
export class WorkflowStepPendingWakeUpHandlerWorkspaceService
  implements
    PendingWakeUpOwnerHandler<WorkflowRunWorkspaceEntity>,
    OnModuleInit
{
  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register(
      'WORKFLOW_STEP',
      this,
    );
  }

  buildResumeJobOptions(workflowRunId: string): QueueJobOptions {
    return buildRunWorkflowJobOptions(workflowRunId);
  }

  async getOwnerState({
    workspaceId,
    ownerId: workflowRunId,
    ownerKey: stepId,
  }: PendingWakeUpEntity): Promise<
    PendingWakeUpOwnerState<WorkflowRunWorkspaceEntity>
  > {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });
    const status = getWorkflowStepWaitingState({ workflowRun, stepId });

    if (status === 'NOT_READY') {
      return { status };
    }

    return status === 'WAITING' && isDefined(workflowRun)
      ? { status, owner: workflowRun }
      : { status: 'GONE', owner: workflowRun };
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
    owner: workflowRun,
    isOwnerGone,
  }: {
    wakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    owner: WorkflowRunWorkspaceEntity | null;
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
      !isDefined(workflowRun) ||
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
