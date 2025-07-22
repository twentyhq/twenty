import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { getWorkflowRunContext, StepStatus } from 'twenty-shared/workflow';
import { WorkflowRunStepInfo } from 'twenty-shared/src/workflow/types/WorkflowRunStateStepInfos';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  WorkflowBranchExecutorInput,
  WorkflowExecutorInput,
} from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingService: BillingService,
  ) {}

  async executeFromSteps({
    stepIds,
    workflowRunId,
    workspaceId,
    shouldComputeWorkflowRunStatus = true,
  }: WorkflowExecutorInput) {
    await Promise.all(
      stepIds.map(async (stepIdToExecute) => {
        await this.executeFromStep({
          stepId: stepIdToExecute,
          workflowRunId,
          workspaceId,
        });
      }),
    );

    if (shouldComputeWorkflowRunStatus) {
      await this.computeWorkflowRunStatus({
        workflowRunId,
        workspaceId,
      });
    }
  }

  private async executeFromStep({
    stepId,
    workflowRunId,
    workspaceId,
  }: WorkflowBranchExecutorInput) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;

    const steps = workflowRun.state.flow.steps;

    const stepToExecute = steps.find((step) => step.id === stepId);

    if (!stepToExecute) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'Step not found',
      });

      return;
    }

    if (
      !canExecuteStep({
        stepId,
        steps,
        stepInfos,
        workflowRunStatus: workflowRun.status,
      })
    ) {
      return;
    }

    let actionOutput: WorkflowActionOutput;

    if (await this.canBillWorkflowNodeExecution(workspaceId)) {
      const workflowAction = this.workflowActionFactory.get(stepToExecute.type);

      await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
        stepId,
        stepInfo: {
          status: StepStatus.RUNNING,
        },
        workflowRunId,
        workspaceId,
      });

      try {
        actionOutput = await workflowAction.execute({
          currentStepId: stepId,
          steps,
          context: getWorkflowRunContext(stepInfos),
        });
      } catch (error) {
        actionOutput = {
          error: error.message ?? 'Execution result error, no data or error',
        };
      }
    } else {
      actionOutput = {
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      };
    }

    const isPendingEvent = actionOutput.pendingEvent;

    const isSuccess = isDefined(actionOutput.result);

    const isError = isDefined(actionOutput.error);

    const isStopped = actionOutput.shouldEndWorkflowRun;

    if (!isError) {
      this.sendWorkflowNodeRunEvent(workspaceId);
    }

    let stepInfo: WorkflowRunStepInfo;

    if (isPendingEvent) {
      stepInfo = {
        status: StepStatus.PENDING,
      };
    } else if (isStopped) {
      stepInfo = {
        status: StepStatus.STOPPED,
        result: actionOutput?.result,
      };
    } else if (isSuccess) {
      stepInfo = {
        status: StepStatus.SUCCESS,
        result: actionOutput?.result,
      };
    } else {
      stepInfo = {
        status: StepStatus.FAILED,
        error: actionOutput?.error,
      };
    }

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo,
      workflowRunId,
      workspaceId,
    });

    if (
      isSuccess &&
      !isStopped &&
      isDefined(stepToExecute.nextStepIds) &&
      stepToExecute.nextStepIds.length > 0
    ) {
      await this.executeFromSteps({
        stepIds: stepToExecute.nextStepIds,
        workflowRunId,
        workspaceId,
        shouldComputeWorkflowRunStatus: false,
      });
    }
  }

  private async computeWorkflowRunStatus({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;

    const steps = workflowRun.state.flow.steps;

    if (workflowShouldKeepRunning({ stepInfos, steps })) {
      return;
    }

    if (workflowShouldFail({ stepInfos, steps })) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'WorkflowRun failed',
      });

      return;
    }

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.COMPLETED,
    });
  }

  private sendWorkflowNodeRunEvent(workspaceId: string) {
    this.workspaceEventEmitter.emitCustomBatchEvent<BillingUsageEvent>(
      BILLING_FEATURE_USED,
      [
        {
          eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
          value: 1,
        },
      ],
      workspaceId,
    );
  }

  private async canBillWorkflowNodeExecution(workspaceId: string) {
    return (
      !this.billingService.isBillingEnabled() ||
      (await this.billingService.canBillMeteredProduct(
        workspaceId,
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      ))
    );
  }
}
