import { Injectable } from '@nestjs/common';

import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';
import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';
import { buildWaitOutcome } from 'src/modules/workflow/workflow-wait/utils/build-wait-outcome.util';

const PAUSING_STEP_RETRY_DELAY_MS = 2_000;
const PAUSING_STEP_MAX_RETRY_DELAY_MS = 60_000;

@Injectable()
export class WorkflowStepWaitResolverWorkspaceService {
  constructor(
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly findRecordsService: FindRecordsService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async resolve({
    workspaceId,
    waitId,
    event,
    attempt = 0,
  }: ResumeWaitingWorkflowStepJobData): Promise<void> {
    const pendingWait = await this.workflowStepWaitWorkspaceService.findWait({
      workspaceId,
      waitId,
    });

    if (!isDefined(pendingWait)) {
      return;
    }

    const { workflowRunId, stepId } = pendingWait;

    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });
    const stepStatus = workflowRun?.state?.stepInfos?.[stepId]?.status;
    const isRunRunning = workflowRun?.status === WorkflowRunStatus.RUNNING;

    // the wait is armed before its step reads as pending, so the event is held until it does or the run ends
    if (isRunRunning && stepStatus === StepStatus.RUNNING) {
      await this.workflowStepWaitWorkspaceService.scheduleResolution({
        workspaceId,
        workflowRunId,
        waitId,
        event,
        attempt: attempt + 1,
        delayMs: Math.min(
          PAUSING_STEP_RETRY_DELAY_MS * 2 ** attempt,
          PAUSING_STEP_MAX_RETRY_DELAY_MS,
        ),
      });

      return;
    }

    let readableEvent = event;

    // a record the run cannot read must not resume it, so the wait goes on for another event
    if (isRunRunning && stepStatus === StepStatus.PENDING && isDefined(event)) {
      const readableRecord = await this.findRecordReadableByRun({
        workspaceId,
        workflowRunId,
        event,
      });

      if (!isDefined(readableRecord)) {
        return;
      }

      readableEvent = { ...event, record: readableRecord };
    }

    const claimedWait = await this.workflowStepWaitWorkspaceService.claim({
      workspaceId,
      waitId,
    });

    if (!isDefined(claimedWait) || !isDefined(workflowRun)) {
      return;
    }

    // the claimed wait is gone, so a step that cannot resume would wait forever
    try {
      await this.resolveClaimedWait({
        claimedWait,
        workflowRun,
        workspaceId,
        event: readableEvent,
      });
    } catch (error) {
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
    claimedWait,
    workflowRun,
    workspaceId,
    event,
  }: {
    claimedWait: WorkflowStepWaitEntity;
    workflowRun: WorkflowRunWorkspaceEntity;
    workspaceId: string;
    event?: WorkflowWaitEvent;
  }): Promise<void> {
    const { workflowRunId, stepId } = claimedWait;

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

    const outcome = buildWaitOutcome({ wait: claimedWait.wait, event });
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

  private async findRecordReadableByRun({
    workspaceId,
    workflowRunId,
    event,
  }: {
    workspaceId: string;
    workflowRunId: string;
    event: WorkflowWaitEvent;
  }): Promise<Record<string, unknown> | undefined> {
    const [objectName, action] = event.eventName.split('.');

    const { authContext, rolePermissionConfig } =
      await this.workflowExecutionContextService.getExecutionContext({
        workflowRunId,
        workspaceId,
      });

    const { success, result } = await this.findRecordsService.execute({
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

    const record = success ? result?.records[0] : undefined;

    return isPlainObject(record) ? record : undefined;
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
