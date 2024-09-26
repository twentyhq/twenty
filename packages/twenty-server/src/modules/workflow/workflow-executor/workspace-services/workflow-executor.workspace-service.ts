import { Injectable } from '@nestjs/common';

import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import {
  WorkflowActionType,
  WorkflowStep,
} from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutionOutput = {
  steps: {
    type: WorkflowActionType;
    result: object | undefined;
    error: object | undefined;
  }[];
  error?: object;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(private readonly workflowActionFactory: WorkflowActionFactory) {}

  async execute({
    currentStepIndex,
    steps,
    payload,
    output,
    attemptCount = 1,
  }: {
    currentStepIndex: number;
    steps: WorkflowStep[];
    output: WorkflowExecutionOutput;
    payload?: object;
    attemptCount?: number;
  }): Promise<WorkflowExecutionOutput> {
    if (currentStepIndex >= steps.length) {
      return output;
    }

    const step = steps[currentStepIndex];

    const workflowAction = this.workflowActionFactory.get(step.type);

    const result = await workflowAction.execute({
      step,
      payload,
    });

    const stepOutput = {
      type: step.type,
      result: result.result,
      error: result.error,
    };

    const updatedOutput = {
      ...output,
      steps: [...output.steps, stepOutput],
    };

    if (result.result) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        payload: result.result,
        output: updatedOutput,
      });
    }

    if (!result.error) {
      throw new WorkflowExecutorException(
        'Execution result error, no data or error',
        WorkflowExecutorExceptionCode.WORKFLOW_FAILED,
      );
    }

    if (step.settings.errorHandlingOptions.continueOnFailure.value) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        payload,
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
        payload,
        output,
        attemptCount: attemptCount + 1,
      });
    }

    throw new WorkflowExecutorException(
      `Workflow failed: ${result.error}`,
      WorkflowExecutorExceptionCode.WORKFLOW_FAILED,
    );
  }
}
