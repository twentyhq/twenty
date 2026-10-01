import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { msg } from '@lingui/core/macro';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import {
  type WorkflowFormAction,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
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
import { WorkflowRunStopWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-stop.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';

@Injectable()
export class WorkflowRunnerWorkspaceService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowRunStopWorkspaceService: WorkflowRunStopWorkspaceService,
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
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

  // A form step completes with its answer; an agent step stays PENDING until the resume job claims it
  async resumeAnsweredStep({
    workspaceId,
    workflowRunId,
    step,
    threadId,
    response,
  }: {
    workspaceId: string;
    workflowRunId: string;
    step: WorkflowAction;
    threadId: string;
    response: Record<string, unknown>;
  }): Promise<void> {
    if (!isWorkflowFormAction(step)) {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RunWorkflowJob.name,
        {
          workspaceId,
          workflowRunId,
          stepToResume: { stepId: step.id, threadId },
        },
        buildRunWorkflowJobOptions(workflowRunId),
      );

      return;
    }

    const enrichedResponse =
      await this.workflowVersionStepOperationsWorkspaceService.enrichFormStepResponse(
        {
          workspaceId,
          step,
          response,
          recordReadContext: await this.findFormRecordReadContext({
            workspaceId,
            workflowRunId,
            step,
          }),
        },
      );

    const hasCompletedStep =
      await this.workflowRunWorkspaceService.updateStepInfoIfPending({
        stepId: step.id,
        stepInfo: {
          status: StepStatus.SUCCESS,
          result: enrichedResponse,
        },
        expectedThreadId: threadId,
        workspaceId,
        workflowRunId,
      });

    if (hasCompletedStep) {
      await this.resume({
        workspaceId,
        workflowRunId,
        lastExecutedStepId: step.id,
      });
    }
  }

  private async findFormRecordReadContext({
    workspaceId,
    workflowRunId,
    step,
  }: {
    workspaceId: string;
    workflowRunId: string;
    step: WorkflowFormAction;
  }): Promise<WorkflowExecutionContext | undefined> {
    if (!step.settings.input.some((field) => field.type === 'RECORD')) {
      return undefined;
    }

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const applicationBoundExecutionContext =
      await this.workflowExecutionContextService
        .getApplicationBoundExecutionContext({ workflowRun, workspaceId })
        .catch((error: unknown) => {
          if (error instanceof WorkflowStepExecutorException) {
            throw new WorkflowVersionStepException(
              error.message,
              WorkflowVersionStepExceptionCode.INVALID_REQUEST,
              {
                userFriendlyMessage: msg`The permissions of this run no longer allow submitting this form.`,
              },
            );
          }

          throw error;
        });

    return applicationBoundExecutionContext ?? undefined;
  }

  async stopWorkflowRun(workspaceId: string, workflowRunId: string) {
    return this.workflowRunStopWorkspaceService.stopWorkflowRun(
      workspaceId,
      workflowRunId,
    );
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
      // Revert so the run isn't left RUNNING without a worker job
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
