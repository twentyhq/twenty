import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  StepOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  WorkflowBranchExecutorInput,
  WorkflowExecutorInput,
} from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { StepStatus } from 'src/modules/workflow/workflow-executor/types/workflow-run-step-info.type';
import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.utils';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_RETRIES_ON_FAILURE = 3;

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
  }

  private async executeFromStep({
    stepId,
    attemptCount = 1,
    workflowRunId,
    workspaceId,
  }: WorkflowBranchExecutorInput) {
    const workflowRunInfo = await this.getWorkflowRunInfoOrEndWorkflowRun({
      stepId: stepId,
      workflowRunId,
      workspaceId,
    });

    if (!isDefined(workflowRunInfo)) {
      return;
    }

    const { stepToExecute, steps, context } = workflowRunInfo;

    if (!canExecuteStep({ stepId: stepToExecute.id, steps, context })) {
      return;
    }

    const checkCanBillWorkflowNodeExecution =
      await this.checkCanBillWorkflowNodeExecutionOrEndWorkflowRun({
        stepIdToExecute: stepToExecute.id,
        workflowRunId,
        workspaceId,
      });

    if (!checkCanBillWorkflowNodeExecution) {
      return;
    }

    const workflowAction = this.workflowActionFactory.get(stepToExecute.type);

    let actionOutput: WorkflowActionOutput;

    await this.workflowRunWorkspaceService.updateWorkflowRunStepStatus({
      workflowRunId,
      stepId: stepToExecute.id,
      workspaceId,
      stepStatus: StepStatus.RUNNING,
    });

    try {
      actionOutput = await workflowAction.execute({
        currentStepId: stepId,
        steps,
        context,
      });
    } catch (error) {
      actionOutput = {
        error: error.message ?? 'Execution result error, no data or error',
      };
    }

    if (!actionOutput.error) {
      this.sendWorkflowNodeRunEvent(workspaceId);
    }

    const stepOutput: StepOutput = {
      id: stepToExecute.id,
      output: actionOutput,
    };

    if (actionOutput.pendingEvent) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        workspaceId,
        stepStatus: StepStatus.PENDING,
      });

      return;
    }

    const actionOutputSuccess = isDefined(actionOutput.result);

    const isValidActionOutput =
      actionOutputSuccess ||
      stepToExecute.settings.errorHandlingOptions.continueOnFailure.value;

    if (isValidActionOutput) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        workspaceId,
        stepStatus: isDefined(actionOutput.result)
          ? StepStatus.SUCCESS
          : StepStatus.FAILED,
      });

      if (
        !isDefined(stepToExecute.nextStepIds) ||
        stepToExecute.nextStepIds.length === 0 ||
        actionOutput.shouldEndWorkflowRun === true
      ) {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.COMPLETED,
        });

        return;
      }

      await this.executeFromSteps({
        stepIds: stepToExecute.nextStepIds,
        workflowRunId,
        workspaceId,
      });

      return;
    }

    if (
      stepToExecute.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      await this.executeFromStep({
        stepId,
        attemptCount: attemptCount + 1,
        workflowRunId,
        workspaceId,
      });

      return;
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput,
      workspaceId,
      stepStatus: StepStatus.FAILED,
    });

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.FAILED,
      error: stepOutput.output.error,
    });
  }

  private async getWorkflowRunInfoOrEndWorkflowRun({
    stepId,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    if (!isDefined(workflowRun)) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: `WorkflowRun ${workflowRunId} not found`,
      });

      return;
    }

    const steps = workflowRun.output?.flow.steps;

    const context = workflowRun.context;

    if (!isDefined(steps)) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'Steps undefined',
      });

      return;
    }

    if (!isDefined(context)) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'Context not found',
      });

      return;
    }

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

    return { stepToExecute, steps, context };
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

  private async checkCanBillWorkflowNodeExecutionOrEndWorkflowRun({
    stepIdToExecute,
    workflowRunId,
    workspaceId,
  }: {
    stepIdToExecute: string;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const canBillWorkflowNodeExecution =
      !this.billingService.isBillingEnabled() ||
      (await this.billingService.canBillMeteredProduct(
        workspaceId,
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      ));

    if (!canBillWorkflowNodeExecution) {
      const billingOutput = {
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workspaceId,
        workflowRunId,
        stepOutput: {
          id: stepIdToExecute,
          output: billingOutput,
        },
        stepStatus: StepStatus.FAILED,
      });

      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      });
    }

    return canBillWorkflowNodeExecution;
  }
}
