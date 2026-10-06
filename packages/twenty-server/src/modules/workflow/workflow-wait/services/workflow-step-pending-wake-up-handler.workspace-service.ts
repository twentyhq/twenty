import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import {
  type PendingWakeUpBeforeClaimDecision,
  type PendingWakeUpOwnerHandler,
} from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { computePendingWakeUpRetryDelayMs } from 'src/engine/core-modules/pending-wake-up/utils/compute-pending-wake-up-retry-delay-ms.util';
import { decidePendingWakeUpOnEventRecord } from 'src/engine/core-modules/pending-wake-up/utils/decide-pending-wake-up-on-event-record.util';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { isWorkflowRunNotFoundError } from 'src/modules/workflow/workflow-runner/utils/is-workflow-run-not-found-error.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';

type WorkflowStepResolveContext = {
  workflowRun: WorkflowRunWorkspaceEntity | null;
};

// A WORKFLOW_STEP wake-up is owned by a workflow run and keyed by the step that waits
@Injectable()
export class WorkflowStepPendingWakeUpHandlerWorkspaceService
  implements
    PendingWakeUpOwnerHandler<WorkflowStepResolveContext>,
    OnModuleInit
{
  readonly ownerType = 'WORKFLOW_STEP';

  private readonly logger = new Logger(
    WorkflowStepPendingWakeUpHandlerWorkspaceService.name,
  );

  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly findRecordsService: FindRecordsService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register(this);
  }

  buildResumeJobOptions(workflowRunId: string): QueueJobOptions {
    return buildRunWorkflowJobOptions(workflowRunId);
  }

  async beforeClaim({
    wakeUp,
    event,
    attempt,
    recordReadAttempt,
  }: {
    wakeUp: PendingWakeUpEntity;
    event?: PendingWakeUpEvent;
    attempt: number;
    recordReadAttempt: number;
  }): Promise<PendingWakeUpBeforeClaimDecision<WorkflowStepResolveContext>> {
    const { workspaceId, ownerId: workflowRunId, ownerKey: stepId } = wakeUp;

    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });
    const stepStatus = workflowRun?.state?.stepInfos?.[stepId]?.status;
    const isRunRunning = workflowRun?.status === WorkflowRunStatus.RUNNING;

    // the wait is armed before its step reads as pending, so the event is held until it does or the run ends
    if (isRunRunning && stepStatus === StepStatus.RUNNING) {
      return {
        type: 'RETRY_LATER',
        attempt: attempt + 1,
        delayMs: computePendingWakeUpRetryDelayMs(attempt),
      };
    }

    if (isRunRunning && stepStatus === StepStatus.PENDING && isDefined(event)) {
      const { authContext, rolePermissionConfig } =
        await this.workflowExecutionContextService.getExecutionContext({
          workflowRunId,
          workspaceId,
        });

      return decidePendingWakeUpOnEventRecord({
        findRecordsService: this.findRecordsService,
        event,
        authContext,
        rolePermissionConfig,
        recordReadAttempt,
        context: { workflowRun },
        onRecordReadGivenUp: (error) =>
          this.logger.warn(
            `Wait ${wakeUp.id} of workflow run ${workflowRunId} kept waiting after its ${event.eventName} record could not be read: ${error}`,
          ),
      });
    }

    return { type: 'RESOLVE', context: { workflowRun } };
  }

  async resolve({
    claimedWakeUp,
    outcome,
    context: { workflowRun },
  }: {
    claimedWakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    context: WorkflowStepResolveContext;
  }): Promise<void> {
    if (!isDefined(workflowRun)) {
      return;
    }

    const {
      workspaceId,
      ownerId: workflowRunId,
      ownerKey: stepId,
    } = claimedWakeUp;

    // the claimed wait is gone, so a step that cannot resume would wait forever
    try {
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
