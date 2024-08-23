import { Injectable } from '@nestjs/common';

import { WorkflowStep } from 'src/modules/workflow/common/types/workflow-step.type';
import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-executor.exception';
import { WorkflowStepExecutorFactory } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.factory';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutionOutput = {
  data?: object;
  error?: object;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowStepExecutorFactory: WorkflowStepExecutorFactory,
  ) {}

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
        data: payload,
      };
    }

    const step = steps[currentStepIndex];

    const workflowStepExecutor = this.workflowStepExecutorFactory.get(
      step.type,
    );

    const result = await workflowStepExecutor.execute({
      step,
      payload,
    });

    if (result.data) {
      return await this.execute({
        currentStepIndex: currentStepIndex + 1,
        steps,
        payload: result.data,
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
