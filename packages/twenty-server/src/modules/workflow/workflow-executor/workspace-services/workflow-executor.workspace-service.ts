import { Injectable } from '@nestjs/common';

import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutionOutput = {
  result?: object;
  error?: object;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(private readonly workflowActionFactory: WorkflowActionFactory) {}

  async execute({
    currentStepIndex,
    steps,
    payload,
    attemptCount = 1,
  }: {
    currentStepIndex: number;
    steps: WorkflowStep[];
    payload?: object;
    attemptCount?: number;
  }): Promise<WorkflowExecutionOutput> {
    if (currentStepIndex >= steps.length) {
      return {
        result: payload,
      };
    }

    const step = steps[currentStepIndex];

    const workflowAction = this.workflowActionFactory.get(step.type);

    const result = await workflowAction.execute({
      step,
      payload,
    });

    if (result.result) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        payload: result.result,
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
        attemptCount: attemptCount + 1,
      });
    }

    throw new WorkflowExecutorException(
      `Workflow failed: ${result.error}`,
      WorkflowExecutorExceptionCode.WORKFLOW_FAILED,
    );
  }
}
