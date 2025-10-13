import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  getWorkflowRunContext,
  StepStatus,
  WorkflowRunStepInfo,
  WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  type WorkflowBranchExecutorInput,
  type WorkflowExecutorInput,
} from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { shouldSkipStepExecution } from 'src/modules/workflow/workflow-executor/utils/should-skip-step-execution.util';
import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly billingService: BillingService,
  ) {}

  async executeFromSteps({
    stepIds,
    workflowRunId,
    workspaceId,
    shouldComputeWorkflowRunStatus = true,
    currentStepCount = 0,
  }: WorkflowExecutorInput) {
    await Promise.all(
      stepIds.map(async (stepIdToExecute) => {
        await this.executeFromStep({
          stepId: stepIdToExecute,
          workflowRunId,
          workspaceId,
          currentStepCount,
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
    currentStepCount,
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

    let actionOutput: WorkflowActionOutput;

    if (
      shouldExecuteStep({
        step: stepToExecute,
        steps,
        stepInfos,
        workflowRunStatus: workflowRun.status,
      })
    ) {
      actionOutput = await this.executeStep({
        step: stepToExecute,
        steps,
        stepInfos,
        workflowRunId,
        workspaceId,
      });
    } else if (
      shouldSkipStepExecution({
        step: stepToExecute,
        steps,
        stepInfos,
      })
    ) {
      actionOutput = {
        shouldSkipStepExecution: true,
      };
    } else {
      return;
    }

    const isError = isDefined(actionOutput.error);

    if (!isError) {
      this.sendWorkflowNodeRunEvent(workspaceId);
    }

    const { shouldProcessNextSteps } = await this.processStepExecutionResult({
      actionOutput,
      stepId,
      workflowRunId,
      workspaceId,
    });

    if (!shouldProcessNextSteps) {
      return;
    }

    const shouldRunAnotherJob = currentStepCount && currentStepCount > 100;

    if (shouldRunAnotherJob) {
      await this.workflowRunnerWorkspaceService.enqueueWorkflowRun(
        workspaceId,
        workflowRunId,
        stepId,
      );

      return;
    }

    const nextStepIdsToExecute = await this.getNextStepIdsToExecute({
      executedStep: stepToExecute,
      executedStepResult: actionOutput,
    });

    if (isDefined(nextStepIdsToExecute) && nextStepIdsToExecute.length > 0) {
      await this.executeFromSteps({
        stepIds: nextStepIdsToExecute,
        workflowRunId,
        workspaceId,
        shouldComputeWorkflowRunStatus: false,
        currentStepCount: (currentStepCount ?? 0) + 1,
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

  private async getNextStepIdsToExecute({
    executedStep,
    executedStepResult,
  }: {
    executedStep: WorkflowAction;
    executedStepResult: WorkflowActionOutput;
  }) {
    const isIteratorStep = isWorkflowIteratorAction(executedStep);

    if (isIteratorStep) {
      const iteratorStepResult =
        executedStepResult.result as WorkflowIteratorResult;

      if (!iteratorStepResult.hasProcessedAllItems) {
        return isString(executedStep.settings.input.initialLoopStepIds)
          ? JSON.parse(executedStep.settings.input.initialLoopStepIds)
          : executedStep.settings.input.initialLoopStepIds;
      }
    }

    return executedStep.nextStepIds;
  }

  private async processStepExecutionResult({
    actionOutput,
    stepId,
    workflowRunId,
    workspaceId,
  }: {
    actionOutput: WorkflowActionOutput;
    stepId: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<{ shouldProcessNextSteps: boolean }> {
    const isPendingEvent = actionOutput.pendingEvent;
    const isSuccess = isDefined(actionOutput.result);
    const isStopped = actionOutput.shouldEndWorkflowRun ?? false;
    const isNotFinished = actionOutput.shouldRemainRunning ?? false;
    const isSkipped = actionOutput.shouldSkipStepExecution ?? false;

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
    } else if (isNotFinished) {
      stepInfo = {
        status: StepStatus.RUNNING,
        result: actionOutput?.result,
      };
    } else if (isSuccess) {
      stepInfo = {
        status: StepStatus.SUCCESS,
        result: actionOutput?.result,
      };
    } else if (isSkipped) {
      stepInfo = {
        status: StepStatus.SKIPPED,
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

    return {
      shouldProcessNextSteps: isSuccess || isStopped || isSkipped,
    };
  }

  private async executeStep({
    step,
    steps,
    stepInfos,
    workflowRunId,
    workspaceId,
  }: {
    step: WorkflowAction;
    steps: WorkflowAction[];
    stepInfos: WorkflowRunStepInfos;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const canBill = await this.canBillWorkflowNodeExecution(workspaceId);

    if (!canBill) {
      return {
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      };
    }

    const stepId = step.id;

    const workflowAction = this.workflowActionFactory.get(step.type);

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo: {
        ...stepInfos[stepId],
        status: StepStatus.RUNNING,
      },
      workflowRunId,
      workspaceId,
    });

    try {
      return await workflowAction.execute({
        currentStepId: stepId,
        steps,
        context: getWorkflowRunContext(stepInfos),
        runInfo: {
          workflowRunId,
          workspaceId,
        },
      });
    } catch (error) {
      return {
        error: error.message ?? 'Execution result error, no data or error',
      };
    }
  }
}
