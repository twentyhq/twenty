import { Injectable } from '@nestjs/common';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import {
  WorkflowActionType,
  WorkflowStep,
} from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorOutput = {
  steps: {
    type: WorkflowActionType;
    result: object | undefined;
    error: object | undefined;
  }[];
  status: WorkflowRunStatus;
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
    output: WorkflowExecutorOutput;
    payload?: object;
    attemptCount?: number;
  }): Promise<WorkflowExecutorOutput> {
    if (currentStepIndex >= steps.length) {
      return { ...output, status: WorkflowRunStatus.COMPLETED };
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
      return {
        ...output,
        steps: [
          ...output.steps,
          {
            type: step.type,
            result: undefined,
            error: {
              errorMessage: 'Execution result error, no data or error',
            },
          },
        ],
        status: WorkflowRunStatus.FAILED,
      };
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

    return { ...updatedOutput, status: WorkflowRunStatus.FAILED };
  }
}
