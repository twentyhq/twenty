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
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowExecutorFactory: WorkflowExecutorFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingService: BillingService,
  ) {}

  async executeBranch({
    stepIdsToExecute,
    steps,
    context,
    workflowRunId,
  }: Omit<WorkflowExecutorInput, 'currentStepId'> & {
    stepIdsToExecute: string[];
  }) {
    await Promise.all(
      stepIdsToExecute.map(async (stepIdToExecute) => {
        await this.execute({
          currentStepId: stepIdToExecute,
          steps,
          context,
          workflowRunId,
        });
      }),
    );
  }

  private async execute({
    currentStepId,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput) {
    const workspaceId = this.getWorkspaceIdOrThrow();

    const step = await this.getStepOrEndWorkflowRun({
      currentStepId,
      steps,
      workspaceId,
      workflowRunId,
    });

    if (!step) {
      return;
    }

    if (
      !(await this.checkBillingAllowedOrEndWorkflowRun({
        step,
        context,
        workflowRunId,
        workspaceId,
      }))
    ) {
      return;
    }

    const workflowExecutor = this.workflowExecutorFactory.get(step.type);

    let actionOutput: WorkflowExecutorOutput;

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

    const stepOutput: StepOutput = {
      id: step.id,
      output: actionOutput,
    };

    const { continueOnFailure, retryOnFailure } =
      step.settings.errorHandlingOptions;

    const shouldExecuteNextSteps =
      isDefined(actionOutput.result) || continueOnFailure.value;

    const shouldRetry =
      isDefined(actionOutput.error) &&
      retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE;

    if (shouldRetry) {
      await this.execute({
        workflowRunId,
        currentStepId,
        steps,
        context,
        attemptCount: attemptCount + 1,
      });

      return;
    }

    const { context: updatedContext } =
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context: isDefined(actionOutput.result)
          ? {
              ...context,
              [step.id]: actionOutput.result,
            }
          : context,
        workspaceId,
      });

    if (!actionOutput.error) {
      this.sendWorkflowNodeRunEvent(workspaceId);
    }

    if (actionOutput.pendingEvent) {
      return;
    }

    if (shouldExecuteNextSteps) {
      if (!isDefined(step.nextStepIds) || step.nextStepIds.length === 0) {
        await this.endWorkflowRunIfCompleted({
          context: updatedContext,
          steps,
          workflowRunId,
          workspaceId,
        });

        return;
      }

      await this.executeBranch({
        workflowRunId,
        stepIdsToExecute: step.nextStepIds,
        steps,
        context: updatedContext,
      });

      return;
    }

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.FAILED,
      error: actionOutput.error,
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

  private getWorkspaceIdOrThrow() {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

    return workspaceId;
  }

  private async getStepOrEndWorkflowRun({
    currentStepId,
    steps,
    workflowRunId,
    workspaceId,
  }: Pick<
    WorkflowExecutorInput,
    'currentStepId' | 'steps' | 'workflowRunId'
  > & { workspaceId: string }) {
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

    return step;
  }

  private async checkBillingAllowedOrEndWorkflowRun({
    workflowRunId,
    workspaceId,
    step,
    context,
  }: Pick<WorkflowExecutorInput, 'context' | 'workflowRunId'> & {
    workspaceId: string;
    step: WorkflowAction;
  }) {
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
        context,
      });

      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      });

      return false;
    }

    return true;
  }

  private async endWorkflowRunIfCompleted({
    context,
    steps,
    workflowRunId,
    workspaceId,
  }: Pick<WorkflowExecutorInput, 'context' | 'steps' | 'workflowRunId'> & {
    workspaceId: string;
  }) {
    if (Object.keys(context).length - 1 === steps.length) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.COMPLETED,
      });
    }
  }
}
