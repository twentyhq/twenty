import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { isDefined, isPlainObject } from 'twenty-shared/utils';
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
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { isWorkflowRunNotFoundError } from 'src/modules/workflow/workflow-runner/utils/is-workflow-run-not-found-error.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';
import { restrictWaitEventToReadableRecord } from 'src/modules/workflow/workflow-wait/utils/restrict-wait-event-to-readable-record.util';

const RETRY_BASE_DELAY_MS = 2_000;
const RETRY_MAX_DELAY_MS = 60_000;
const RECORD_READ_MAX_ATTEMPTS = 8;

const computeRetryDelayMs = (attempt: number) =>
  Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);

type RunRecordRead =
  | { status: 'READABLE'; record: Record<string, unknown> }
  | { status: 'UNREADABLE' }
  | { status: 'FAILED'; error?: string };

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
    private readonly workflowActionFactory: WorkflowActionFactory,
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
        delayMs: computeRetryDelayMs(attempt),
      };
    }

    // a record the run cannot read must not resume it, so the wait goes on for another event
    if (isRunRunning && stepStatus === StepStatus.PENDING && isDefined(event)) {
      const recordRead = await this.readRecordAsRun({
        workspaceId,
        workflowRunId,
        event,
      });

      // a failed read cannot tell a transient error from an object the run cannot read, so it is retried a few times
      if (recordRead.status === 'FAILED') {
        if (recordReadAttempt < RECORD_READ_MAX_ATTEMPTS) {
          return {
            type: 'RETRY_LATER',
            recordReadAttempt: recordReadAttempt + 1,
            delayMs: computeRetryDelayMs(recordReadAttempt),
          };
        }

        this.logger.warn(
          `Wait ${wakeUp.id} of workflow run ${workflowRunId} kept waiting after its ${event.eventName} record could not be read: ${recordRead.error}`,
        );

        return { type: 'IGNORE' };
      }

      if (recordRead.status === 'UNREADABLE') {
        return { type: 'IGNORE' };
      }

      return {
        type: 'RESOLVE',
        event: restrictWaitEventToReadableRecord({
          event,
          readableRecord: recordRead.record,
        }),
        context: { workflowRun },
      };
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

    const { workspaceId, ownerId: workflowRunId } = claimedWakeUp;

    // the claimed wait is gone, so a step that cannot resume would wait forever
    try {
      await this.resolveClaimedWait({
        claimedWakeUp,
        workflowRun,
        outcome,
      });
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

  private async resolveClaimedWait({
    claimedWakeUp,
    workflowRun,
    outcome,
  }: {
    claimedWakeUp: PendingWakeUpEntity;
    workflowRun: WorkflowRunWorkspaceEntity;
    outcome: PendingWakeUpOutcome;
  }): Promise<void> {
    const {
      workspaceId,
      ownerId: workflowRunId,
      ownerKey: stepId,
    } = claimedWakeUp;

    const step = workflowRun.state?.flow?.steps?.find(
      (candidate) => candidate.id === stepId,
    );
    const stepInfo = workflowRun.state?.stepInfos?.[stepId];

    if (
      workflowRun.status !== WorkflowRunStatus.RUNNING ||
      !isDefined(step) ||
      stepInfo?.status !== StepStatus.PENDING
    ) {
      return;
    }

    const workflowAction = this.workflowActionFactory.get(step.type);

    const resolution = isDefined(workflowAction.resolveWait)
      ? await workflowAction.resolveWait({
          step,
          stepInfo,
          outcome,
          runInfo: { workflowRunId, workspaceId },
        })
      : { result: buildDefaultWaitResult(outcome) };

    if ('resumedThreadId' in resolution) {
      await this.enqueueRunWorkflowJob({
        workspaceId,
        workflowRunId,
        stepToResume: { stepId, threadId: resolution.resumedThreadId },
      });

      return;
    }

    const hasCompletedStep =
      await this.workflowRunWorkspaceService.updateStepInfoIfPending({
        stepId,
        stepInfo: { status: StepStatus.SUCCESS, result: resolution.result },
        workflowRunId,
        workspaceId,
      });

    if (hasCompletedStep) {
      await this.enqueueRunWorkflowJob({
        workspaceId,
        workflowRunId,
        lastExecutedStepId: stepId,
      });
    }
  }

  private async readRecordAsRun({
    workspaceId,
    workflowRunId,
    event,
  }: {
    workspaceId: string;
    workflowRunId: string;
    event: PendingWakeUpEvent;
  }): Promise<RunRecordRead> {
    const [objectName, action] = event.eventName.split('.');

    const { authContext, rolePermissionConfig } =
      await this.workflowExecutionContextService.getExecutionContext({
        workflowRunId,
        workspaceId,
      });

    const { success, result, error } = await this.findRecordsService.execute({
      objectName,
      // a deleted record only reads when the filter asks for deleted records
      filter:
        action === 'deleted'
          ? { id: { eq: event.recordId }, deletedAt: { is: 'NOT_NULL' } }
          : { id: { eq: event.recordId } },
      limit: 1,
      authContext,
      rolePermissionConfig,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!success) {
      return { status: 'FAILED', error };
    }

    const record = result?.records[0];

    return isPlainObject(record)
      ? { status: 'READABLE', record }
      : { status: 'UNREADABLE' };
  }

  private async enqueueRunWorkflowJob(
    jobData: RunWorkflowJobData,
  ): Promise<void> {
    await this.messageQueueService.add<RunWorkflowJobData>(
      RUN_WORKFLOW_JOB_NAME,
      jobData,
      buildRunWorkflowJobOptions(jobData.workflowRunId),
    );
  }
}
