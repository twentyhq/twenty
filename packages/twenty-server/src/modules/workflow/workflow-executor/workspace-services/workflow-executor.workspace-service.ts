import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowRunOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';
import { isWorkflowAction } from 'src/modules/workflow/workflow-executor/guards/is-workflow-action.guard';
import { isWorkflowStep } from 'src/modules/workflow/workflow-executor/guards/is-workflow-step.guard';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowStepResult } from 'src/modules/workflow/workflow-executor/types/workflow-step-result.type';
import {
  WorkflowActionStep,
  WorkflowStepType,
} from 'src/modules/workflow/workflow-executor/types/workflow-step.type';
import { WorkflowActionExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/workspace-services/workflow-action-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorState = {
  stepsOutput: WorkflowRunOutput['stepsOutput'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService implements WorkflowExecutor {
  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowActionExecutorWorkspaceService: WorkflowActionExecutorWorkspaceService,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput): Promise<WorkflowStepResult> {
    if (currentStepIndex >= steps.length) {
      return {
        error: {
          errorMessage: 'No more steps to execute',
        },
      };
    }

    const step = steps[currentStepIndex];

    if (isWorkflowAction(step)) {
      return this.executeAction({
        currentStepIndex,
        steps,
        context,
        attemptCount,
        workflowRunId,
      });
    } else {
      return this.executeStep({
        currentStepIndex,
        steps,
        context,
        attemptCount,
        workflowRunId,
      });
    }
  }

  private async executeStep({
    currentStepIndex,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput) {
    const step = steps[currentStepIndex];

    if (!isWorkflowStep(step)) {
      throw new WorkflowExecutorException(
        'Step is not a WorkflowStep',
        WorkflowExecutorExceptionCode.INVALID_STEP,
      );
    }

    const stepExecutor = this.getStepExecutor(step);
    let result;

    try {
      result = await stepExecutor.execute({
        currentStepIndex,
        steps,
        context,
        attemptCount,
        workflowRunId,
      });
    } catch (error) {
      result = {
        error: {
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack,
        },
      };
    }

    const error =
      result.error?.errorMessage ??
      (result.result ? undefined : 'Execution result error, no data or error');

    if (!error) {
      this.sendWorkflowNodeRunEvent();
    }

    const stepOutput = {
      id: step.id,
      output: {
        result: result.result,
        error,
      },
    };

    if (result.result) {
      const updatedContext = {
        ...context,
        [step.id]: result.result,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context: updatedContext,
      });

      if (currentStepIndex < steps.length - 1) {
        return await this.execute({
          workflowRunId,
          currentStepIndex: currentStepIndex + 1,
          steps,
          context: updatedContext,
        });
      }

      return {
        result: result.result,
      };
    }

    if (step.stepSettings.errorHandlingOptions.continueOnFailure.value) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context,
      });

      if (currentStepIndex < steps.length - 1) {
        return await this.execute({
          workflowRunId,
          currentStepIndex: currentStepIndex + 1,
          steps,
          context,
        });
      }

      return {
        result: result.result,
      };
    }

    if (
      step.stepSettings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        workflowRunId,
        currentStepIndex,
        steps,
        context,
        attemptCount: attemptCount + 1,
      });
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput,
      context,
    });

    return {
      error: {
        errorMessage: `Execution failed: ${error}`,
      },
    };
  }

  private async executeAction({
    currentStepIndex,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput) {
    const action = steps[currentStepIndex];

    if (!isWorkflowAction(action)) {
      throw new WorkflowExecutorException(
        'Action is not a WorkflowAction',
        WorkflowExecutorExceptionCode.INVALID_STEP,
      );
    }

    let result;

    try {
      result =
        await this.workflowActionExecutorWorkspaceService.executeDeprecated({
          currentStepIndex,
          steps,
          context,
          attemptCount,
          workflowRunId,
        });
    } catch (error) {
      result = {
        error: {
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack,
        },
      };
    }

    const error =
      result.error?.errorMessage ??
      (result.result ? undefined : 'Execution result error, no data or error');

    if (!error) {
      this.sendWorkflowNodeRunEvent();
    }

    const actionOutput = {
      id: action.id,
      output: {
        result: result.result,
        error,
      },
    };

    if (result.result) {
      const updatedContext = {
        ...context,
        [action.id]: result.result,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput: actionOutput,
        context: updatedContext,
      });

      if (currentStepIndex < steps.length - 1) {
        return await this.execute({
          workflowRunId,
          currentStepIndex: currentStepIndex + 1,
          steps,
          context: updatedContext,
        });
      }

      return {
        result: result.result,
      };
    }

    if (action.settings.errorHandlingOptions.continueOnFailure.value) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput: actionOutput,
        context,
      });

      if (currentStepIndex < steps.length - 1) {
        return await this.execute({
          workflowRunId,
          currentStepIndex: currentStepIndex + 1,
          steps,
          context,
        });
      }

      return {
        result: result.result,
      };
    }

    if (
      action.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        workflowRunId,
        currentStepIndex,
        steps,
        context,
        attemptCount: attemptCount + 1,
      });
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput: actionOutput,
      context,
    });

    return {
      error: {
        errorMessage: `Execution failed: ${error}`,
      },
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

  private getStepExecutor(step: WorkflowActionStep) {
    if (step.type === WorkflowStepType.ACTION) {
      return this.workflowActionExecutorWorkspaceService;
    }

    throw new WorkflowExecutorException(
      `Unsupported step type: ${step.type}`,
      WorkflowExecutorExceptionCode.INVALID_STEP,
    );
  }
}
