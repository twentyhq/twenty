import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';
import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';
import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';
import { buildWaitOutcome } from 'src/modules/workflow/workflow-wait/utils/build-wait-outcome.util';

@Injectable()
export class WorkflowStepWaitResolverWorkspaceService {
  constructor(
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowActionFactory: WorkflowActionFactory,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async resolve({
    workspaceId,
    waitId,
    event,
  }: {
    workspaceId: string;
    waitId: string;
    event?: WorkflowWaitEvent;
  }): Promise<void> {
    const claimedWait = await this.workflowStepWaitWorkspaceService.claim({
      workspaceId,
      waitId,
    });

    if (!isDefined(claimedWait)) {
      return;
    }

    // the claimed wait is gone, so a step that cannot resume would wait forever
    try {
      await this.resolveClaimedWait({ claimedWait, workspaceId, event });
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId: claimedWait.workflowRunId,
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
    workspaceId,
    event,
  }: {
    claimedWait: WorkflowStepWaitEntity;
    workspaceId: string;
    event?: WorkflowWaitEvent;
  }): Promise<void> {
    const { workflowRunId, stepId } = claimedWait;

    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    const step = workflowRun?.state?.flow?.steps?.find(
      (candidate) => candidate.id === stepId,
    );
    const stepInfo = workflowRun?.state?.stepInfos?.[stepId];

    if (
      workflowRun?.status !== WorkflowRunStatus.RUNNING ||
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
