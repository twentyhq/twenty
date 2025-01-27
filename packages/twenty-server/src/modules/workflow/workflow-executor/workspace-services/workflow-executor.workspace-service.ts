import { Injectable, Logger } from '@nestjs/common';

import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingMeterEventService } from 'src/engine/core-modules/billing/services/billing-meter-event.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import {
  WorkflowRunOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorOutput = {
  steps: WorkflowRunOutput['steps'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  private readonly logger = new Logger(WorkflowExecutorWorkspaceService.name);
  private readonly workflowNodeRunBillingMeterEventName =
    BillingMeterEventName.WORKFLOW_NODE_RUN;
  constructor(
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly billingMeterEventService: BillingMeterEventService,
    private readonly billingService: BillingService,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
    output,
    attemptCount = 1,
  }: {
    currentStepIndex: number;
    steps: WorkflowAction[];
    output: WorkflowExecutorOutput;
    context: Record<string, unknown>;
    attemptCount?: number;
  }): Promise<WorkflowExecutorOutput> {
    if (currentStepIndex >= steps.length) {
      return { ...output, status: WorkflowRunStatus.COMPLETED };
    }

    const hasWorkspaceSubscriptionOrFreeAccess =
      await this.billingService.hasWorkspaceSubscriptionOrFreeAccess(
        String(context.workspaceId),
      );

    const step = steps[currentStepIndex];

    const workflowAction = this.workflowActionFactory.get(step.type);

    const actionPayload = resolveInput(step.settings.input, context);

    let result: WorkflowActionResult;

    try {
      result = await workflowAction.execute(actionPayload);
    } catch (error) {
      result = {
        error: {
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack,
        },
      };
    }

    const stepOutput = output.steps[step.id];

    const error =
      result.error?.errorMessage ??
      (result.result ? undefined : 'Execution result error, no data or error');

    if (!error && hasWorkspaceSubscriptionOrFreeAccess) {
      await this.billingMeterEventService.sendBillingMeterEvent({
        eventName: this.workflowNodeRunBillingMeterEventName,
        value: 1,
        workspaceId: String(context.workspaceId),
      });
    }

    const updatedStepOutput = {
      id: step.id,
      name: step.name,
      type: step.type,
      outputs: [
        ...(stepOutput?.outputs ?? []),
        {
          attemptCount,
          result: result.result,
          error,
        },
      ],
    };

    const updatedOutput = {
      ...output,
      steps: {
        ...output.steps,
        [step.id]: updatedStepOutput,
      },
    };

    if (result.result) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        context: {
          ...context,
          [step.id]: result.result,
        },
        output: updatedOutput,
      });
    }

    if (step.settings.errorHandlingOptions.continueOnFailure.value) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        context,
        output: updatedOutput,
      });
    }

    if (
      step.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        currentStepIndex,
        steps,
        context,
        output: updatedOutput,
        attemptCount: attemptCount + 1,
      });
    }

    return { ...updatedOutput, status: WorkflowRunStatus.FAILED };
  }
}
