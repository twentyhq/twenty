import { Injectable, Logger } from '@nestjs/common';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowRunOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorOutput = {
  steps: WorkflowRunOutput['steps'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  private readonly logger = new Logger(WorkflowExecutorWorkspaceService.name);
  constructor(
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
    workflowExecutorOutput,
    attemptCount = 1,
    workflowRunId,
  }: {
    currentStepIndex: number;
    steps: WorkflowAction[];
    workflowExecutorOutput: WorkflowExecutorOutput;
    context: Record<string, unknown>;
    attemptCount?: number;
    workflowRunId: string;
  }): Promise<WorkflowExecutorOutput> {
    if (currentStepIndex >= steps.length) {
      return { ...workflowExecutorOutput, status: WorkflowRunStatus.COMPLETED };
    }

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

    const stepOutput = workflowExecutorOutput.steps[step.id];

    const error =
      result.error?.errorMessage ??
      (result.result ? undefined : 'Execution result error, no data or error');

    if (!error) {
      this.sendWorkflowNodeRunEvent();
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

    const updatedOutputSteps = {
      ...workflowExecutorOutput.steps,
      [step.id]: updatedStepOutput,
    };

    const updatedWorkflowExecutorOutput = {
      ...workflowExecutorOutput,
      steps: updatedOutputSteps,
    };

    if (result.result) {
      const updatedContext = {
        ...context,
        [step.id]: result.result,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        output: {
          steps: updatedOutputSteps,
        },
        context: updatedContext,
      });

      return await this.execute({
        workflowRunId,
        currentStepIndex: currentStepIndex + 1,
        steps,
        context: updatedContext,
        workflowExecutorOutput: updatedWorkflowExecutorOutput,
      });
    }

    if (step.settings.errorHandlingOptions.continueOnFailure.value) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        output: {
          steps: updatedOutputSteps,
        },
        context,
      });

      return await this.execute({
        workflowRunId,
        currentStepIndex: currentStepIndex + 1,
        steps,
        context,
        workflowExecutorOutput: updatedWorkflowExecutorOutput,
      });
    }

    if (
      step.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        workflowRunId,
        currentStepIndex,
        steps,
        context,
        workflowExecutorOutput: updatedWorkflowExecutorOutput,
        attemptCount: attemptCount + 1,
      });
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      output: {
        steps: updatedOutputSteps,
      },
      context,
    });

    return {
      ...updatedWorkflowExecutorOutput,
      status: WorkflowRunStatus.FAILED,
    };
  }

  private sendWorkflowNodeRunEvent() {
    const workspaceId =
      this.scopedWorkspaceContextFactory.create().workspaceId ?? '';

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
}
