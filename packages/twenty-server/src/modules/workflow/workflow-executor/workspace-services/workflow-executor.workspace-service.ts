import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

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

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorState = {
  stepsOutput: WorkflowRunOutput['stepsOutput'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService implements WorkflowExecutor {
  constructor(
    private readonly workflowExecutorFactory: WorkflowExecutorFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingService: BillingService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      return {
        error: 'Step not found',
      };
    }

    const workflowExecutor = this.workflowExecutorFactory.get(step.type);

    let actionOutput: WorkflowExecutorOutput;

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

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

      return billingOutput;
    }

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
        context,
        workspaceId,
      });

      return actionOutput;
    }

    const shouldContinue =
      isDefined(actionOutput.result) ||
      step.settings.errorHandlingOptions.continueOnFailure.value;

    if (shouldContinue) {
      const updatedContext = isDefined(actionOutput.result)
        ? {
            ...context,
            [step.id]: actionOutput.result,
          }
        : context;

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context: updatedContext,
        workspaceId,
      });

      if (!isDefined(step.nextStepIds?.[0])) {
        return actionOutput;
      }

      // TODO: handle multiple next steps
      return await this.execute({
        workflowRunId,
        currentStepId: step.nextStepIds[0],
        steps,
        context: updatedContext,
      });
    }

    if (
      step.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        workflowRunId,
        currentStepId,
        steps,
        context,
        attemptCount: attemptCount + 1,
      });
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput,
      context,
      workspaceId,
    });

    return actionOutput;
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
}
