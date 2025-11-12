import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { type ActorMetadata } from 'twenty-shared/types';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { isWorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/guards/is-workflow-form-action.guard';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowRunnerWorkspaceService {
  private readonly logger = new Logger(WorkflowRunnerWorkspaceService.name);
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
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
    const canFeatureBeUsed =
      await this.billingUsageService.canFeatureBeUsed(workspaceId);

    if (!canFeatureBeUsed) {
      this.logger.log(
        'Cannot execute billed function, there is no subscription for this workspace',
      );
    }

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId,
      });

    const remainingRunsToEnqueueCount =
      await this.workflowRunQueueWorkspaceService.getRemainingRunsToEnqueueCountFromCache(
        workspaceId,
      );

    const isQueueLimitReached = remainingRunsToEnqueueCount <= 0;

    const isManualTrigger =
      workflowVersion.trigger?.type === WorkflowTriggerType.MANUAL;

    const shouldEnqueueWorkflowRun = isManualTrigger || !isQueueLimitReached;

    const workflowRunId =
      await this.workflowRunWorkspaceService.createWorkflowRun({
        workflowVersionId,
        workflowRunId: initialWorkflowRunId,
        createdBy: source,
        status: shouldEnqueueWorkflowRun
          ? WorkflowRunStatus.ENQUEUED
          : WorkflowRunStatus.NOT_STARTED,
        triggerPayload: payload,
      });

    if (shouldEnqueueWorkflowRun) {
      await this.enqueueWorkflowRun(workspaceId, workflowRunId);
    }

    return { workflowRunId };
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
    await this.enqueueWorkflowRun(
      workspaceId,
      workflowRunId,
      lastExecutedStepId,
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

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo: {
        status: StepStatus.SUCCESS,
        result: enrichedResponse,
      },
      workspaceId,
      workflowRunId,
    });

    await this.resume({
      workspaceId,
      workflowRunId,
      lastExecutedStepId: stepId,
    });
  }

  async enqueueWorkflowRun(
    workspaceId: string,
    workflowRunId: string,
    lastExecutedStepId?: string,
  ) {
    await this.messageQueueService.add<RunWorkflowJobData>(
      RunWorkflowJob.name,
      {
        workspaceId,
        workflowRunId,
        lastExecutedStepId,
      },
    );
    await this.workflowRunQueueWorkspaceService.increaseWorkflowRunQueuedCount(
      workspaceId,
    );
  }

  async stopWorkflowRun(workspaceId: string, workflowRunId: string) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
      throw new WorkflowRunException(
        'Workflow run is not running',
        WorkflowRunExceptionCode.INVALID_OPERATION,
        {
          userFriendlyMessage: msg`Workflow run is not running`,
        },
      );
    }

    let newStatus: WorkflowRunStatus;

    if (
      workflowHasRunningSteps({
        stepInfos: workflowRun.state.stepInfos,
        steps: workflowRun.state.flow.steps,
      })
    ) {
      await this.workflowRunWorkspaceService.updateWorkflowRun({
        workflowRunId,
        workspaceId,
        partialUpdate: {
          status: WorkflowRunStatus.STOPPING,
        },
      });
      newStatus = WorkflowRunStatus.STOPPING;
    } else {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.STOPPED,
      });
      newStatus = WorkflowRunStatus.STOPPED;
    }

    return {
      id: workflowRun.id,
      status: newStatus,
    };
  }
}
