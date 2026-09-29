import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { isWorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/guards/is-workflow-form-action.guard';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRetryStepInfos } from 'src/modules/workflow/workflow-runner/utils/build-retry-step-infos.util';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { getRunnableStepIds } from 'src/modules/workflow/workflow-runner/utils/get-runnable-step-ids.util';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import {
  type StepAwaitingAnswer,
  WorkflowRunWorkspaceService,
} from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';

@Injectable()
export class WorkflowRunnerWorkspaceService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  async run({
    workspaceId,
    workflowVersionId,
    payload,
    source,
    workflowRunId: initialWorkflowRunId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    payload: object;
    source: ActorMetadata;
    workflowRunId?: string;
  }) {
    const coreWorkflowVersion =
      await this.workflowVersionCoreSyncService.findCoreVersionByWorkspaceVersionId(
        workspaceId,
        workflowVersionId,
      );

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowRunException(
        'Workspace workflow version has no core execution mapping',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    return this.coreWorkflowRunnerService.run({
      workspaceId,
      coreWorkflowVersionId: coreWorkflowVersion.id,
      workflowRunId: initialWorkflowRunId,
      payload,
      source,
    });
  }

  async resume({
    workspaceId,
    workflowRunId,
    lastExecutedStepId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    lastExecutedStepId: string;
  }) {
    await this.messageQueueService.add<RunWorkflowJobData>(
      RunWorkflowJob.name,
      {
        workspaceId,
        workflowRunId,
        lastExecutedStepId,
      },
      buildRunWorkflowJobOptions(workflowRunId),
    );
  }

  async submitFormStep({
    workspaceId,
    stepId,
    workflowRunId,
    response,
  }: {
    workspaceId: string;
    stepId: string;
    workflowRunId: string;
    response: object;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const step = workflowRun.state?.flow?.steps?.find(
      (step) => step.id === stepId,
    );

    if (!isDefined(step)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    if (!isWorkflowFormAction(step)) {
      throw new WorkflowVersionStepException(
        'Step is not a form',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`Step is not a form`,
        },
      );
    }

    const enrichedResponse =
      await this.workflowVersionStepOperationsWorkspaceService.enrichFormStepResponse(
        {
          workspaceId,
          step,
          response,
        },
      );

    const hasCompletedStep =
      await this.workflowRunWorkspaceService.updateStepInfoIfPending({
        stepId,
        stepInfo: {
          status: StepStatus.SUCCESS,
          result: enrichedResponse,
        },
        workspaceId,
        workflowRunId,
      });

    if (!hasCompletedStep) {
      throw new WorkflowVersionStepException(
        'Form is no longer awaiting a submission',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`This form is no longer awaiting a submission`,
        },
      );
    }

    await this.resume({
      workspaceId,
      workflowRunId,
      lastExecutedStepId: stepId,
    });
  }

  // The answer is already recorded in the step's conversation. The step stays
  // PENDING, which keeps its run alive, until the resume job claims it.
  async resumeAgentStepWithAnswer({
    threadId,
    workflowRunId,
    workspaceId,
  }: {
    threadId: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<StepAwaitingAnswer> {
    const stepAwaitingAnswer =
      await this.workflowRunWorkspaceService.findStepAwaitingAnswer({
        threadId,
        workflowRunId,
        workspaceId,
      });

    if (stepAwaitingAnswer.status === 'AWAITING_ANSWER') {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RunWorkflowJob.name,
        {
          workspaceId,
          workflowRunId,
          stepIdToResume: stepAwaitingAnswer.stepId,
        },
        buildRunWorkflowJobOptions(workflowRunId),
      );
    }

    return stepAwaitingAnswer;
  }

  async stopWorkflowRun(workspaceId: string, workflowRunId: string) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stoppableStatuses = [
      WorkflowRunStatus.NOT_STARTED,
      WorkflowRunStatus.ENQUEUED,
      WorkflowRunStatus.RUNNING,
    ];

    if (!stoppableStatuses.includes(workflowRun.status)) {
      return {
        id: workflowRun.id,
        status: workflowRun.status,
      };
    }

    const wasNotStarted = workflowRun.status === WorkflowRunStatus.NOT_STARTED;

    let newStatus: WorkflowRunStatus;

    if (!isDefined(workflowRun.state)) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.STOPPED,
      });
      newStatus = WorkflowRunStatus.STOPPED;
    } else {
      const stepInfos = workflowRun.state.stepInfos;
      const steps = workflowRun.state.flow.steps;

      if (workflowHasRunningSteps({ stepInfos, steps })) {
        const isStopping =
          await this.workflowRunWorkspaceService.markWorkflowRunAsStopping({
            workflowRunId,
            workspaceId,
          });

        if (isStopping) {
          newStatus = WorkflowRunStatus.STOPPING;
        } else {
          // The run changed before the lock was taken, so report what it is now.
          const currentWorkflowRun =
            await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
              workflowRunId,
              workspaceId,
            });

          newStatus = currentWorkflowRun.status;
        }
      } else {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.STOPPED,
        });
        newStatus = WorkflowRunStatus.STOPPED;
      }
    }

    // Release the cached not-started slot only after the stop has been
    // persisted, so a persistence failure can't desync the throttle counter.
    if (wasNotStarted) {
      await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
        workspaceId,
      );
    }

    return {
      id: workflowRun.id,
      status: newStatus,
    };
  }

  async retryWorkflowRun(workspaceId: string, workflowRunId: string) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (workflowRun.status !== WorkflowRunStatus.FAILED) {
      return {
        id: workflowRun.id,
        status: workflowRun.status,
      };
    }

    if (!isDefined(workflowRun.state)) {
      throw new WorkflowRunException(
        'Cannot retry a workflow run without state',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const steps = workflowRun.state.flow.steps;

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryStepInfos({
      steps,
      stepInfos: workflowRun.state.stepInfos,
    });

    const mergedStepInfos = {
      ...workflowRun.state.stepInfos,
      ...stepInfosToUpdate,
    };

    const runnableStepIds = getRunnableStepIds({
      steps,
      stepInfos: mergedStepInfos,
    });

    const stepIdsToRun = Array.from(
      new Set([...stepIdsToRetry, ...runnableStepIds]),
    );

    if (stepIdsToRun.length === 0) {
      return {
        id: workflowRun.id,
        status: workflowRun.status,
      };
    }

    await this.workflowRunWorkspaceService.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        status: WorkflowRunStatus.RUNNING,
        endedAt: null,
        state: {
          ...workflowRun.state,
          stepInfos: mergedStepInfos,
          workflowRunError: undefined,
        },
      },
    });

    try {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RunWorkflowJob.name,
        {
          workspaceId,
          workflowRunId,
          stepIdsToRetry: stepIdsToRun,
        },
        buildRunWorkflowJobOptions(workflowRunId),
      );
    } catch (error) {
      // The job couldn't be enqueued: revert to the previous failed state so
      // the run isn't left stuck as RUNNING without a worker job.
      await this.workflowRunWorkspaceService.updateWorkflowRun({
        workflowRunId,
        workspaceId,
        partialUpdate: {
          status: WorkflowRunStatus.FAILED,
          endedAt: workflowRun.endedAt,
          state: workflowRun.state,
        },
      });

      throw error;
    }

    return {
      id: workflowRun.id,
      status: WorkflowRunStatus.RUNNING,
    };
  }
}
