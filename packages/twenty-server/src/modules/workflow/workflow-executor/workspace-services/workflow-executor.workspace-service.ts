import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  StepOutput,
  WorkflowRunOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutorFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-executor.factory';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { StepStatus } from 'src/modules/workflow/workflow-executor/types/workflow-run-step-info.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorState = {
  stepsOutput: WorkflowRunOutput['stepsOutput'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowExecutorFactory: WorkflowExecutorFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingService: BillingService,
  ) {}

  async execute({
    stepIdsToExecute,
    workflowRunId,
  }: {
    workflowRunId: string;
    stepIdsToExecute: string[];
  }) {
    await Promise.all(
      stepIdsToExecute.map(async (stepIdToExecute) => {
        await this.executeBranch({
          currentStepId: stepIdToExecute,
          workflowRunId,
        });
      }),
    );
  }

  private async executeBranch({
    currentStepId,
    attemptCount = 1,
    workflowRunId,
  }: {
    currentStepId: string;
    attemptCount?: number;
    workflowRunId: string;
  }) {
    ///////////// START REFACTOR BLOCK /////////////
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }
    ///////////// END REFACTOR BLOCK /////////////

    ///////////// START REFACTOR BLOCK /////////////
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (!isDefined(workflowRun)) {
      throw new WorkflowTriggerException(
        `WorkflowRun ${workflowRunId} not found`,
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const steps = workflowRun.output?.flow.steps;

    const context = workflowRun.context;

    if (!isDefined(steps)) {
      throw new WorkflowTriggerException(
        `WorkflowRun ${workflowRunId} steps undefined`,
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    if (!isDefined(context)) {
      throw new WorkflowTriggerException(
        'Context undefined',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    ///////////// END REFACTOR BLOCK /////////////

    ///////////// START REFACTOR BLOCK /////////////
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'Step not found',
      });

      return;
    }
    ///////////// END REFACTOR BLOCK /////////////

    if (!this.canExecuteStep({ step, steps, context })) {
      return;
    }

    ///////////// START REFACTOR BLOCK /////////////
    if (
      this.billingService.isBillingEnabled() &&
      !(await this.canBillWorkflowNodeExecution(workspaceId))
    ) {
      const billingOutput = {
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workspaceId,
        workflowRunId,
        stepOutput: {
          id: step.id,
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

      return;
    }
    ///////////// END REFACTOR BLOCK /////////////

    const workflowExecutor = this.workflowExecutorFactory.get(step.type);

    let actionOutput: WorkflowExecutorOutput;

    await this.workflowRunWorkspaceService.updateWorkflowRunStepStatus({
      workflowRunId,
      stepId: step.id,
      workspaceId,
      stepStatus: StepStatus.RUNNING,
    });

    try {
      actionOutput = await workflowExecutor.execute({
        currentStepId,
        steps,
        context,
        attemptCount,
        workflowRunId,
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
      id: step.id,
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

    const shouldContinue =
      actionOutputSuccess ||
      step.settings.errorHandlingOptions.continueOnFailure.value;

    if (shouldContinue) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        workspaceId,
        stepStatus: isDefined(actionOutput.result)
          ? StepStatus.SUCCESS
          : StepStatus.FAILED,
      });

      if (!isDefined(step.nextStepIds) || step.nextStepIds.length === 0) {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.COMPLETED,
        });

        return;
      }

      await this.execute({
        workflowRunId,
        stepIdsToExecute: step.nextStepIds,
      });

      return;
    }

    if (
      step.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      await this.executeBranch({
        workflowRunId,
        currentStepId,
        attemptCount: attemptCount + 1,
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
    return this.billingService.canBillMeteredProduct(
      workspaceId,
      BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );
  }

  private canExecuteStep({
    context,
    step,
    steps,
  }: Pick<WorkflowExecutorInput, 'context' | 'steps'> & {
    step: WorkflowAction;
  }) {
    const parentSteps = steps.filter((parentStep) =>
      parentStep.nextStepIds?.includes(step.id),
    );

    return parentSteps.every((parentStep) =>
      Object.keys(context).includes(parentStep.id),
    );
  }
}
