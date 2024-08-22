import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowActionExecutorFactory } from 'src/modules/workflow/workflow-action-executor/workflow-action-executor.factory';
import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-executor.exception';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutionOutput = {
  data?: object;
  error?: object;
};

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowActionExecutorFactory: WorkflowActionExecutorFactory,
  ) {}

  async execute({
    action,
    payload,
    attemptCount = 1,
  }: {
    action?: WorkflowAction;
    payload?: object;
    attemptCount?: number;
  }): Promise<WorkflowExecutionOutput> {
    if (!action) {
      return {
        data: payload,
      };
    }

    const workflowActionExecutor = this.workflowActionExecutorFactory.get(
      action.type,
    );

    const result = await workflowActionExecutor.execute({
      action,
      payload,
    });

    if (result.data) {
      return await this.execute({
        action: action.nextAction,
        payload: result.data,
      });
    }

    if (!result.error) {
      throw new WorkflowExecutorException(
        'Execution result error, no data or error',
        WorkflowExecutorExceptionCode.WORKFLOW_FAILED,
      );
    }

    if (action.settings.errorHandlingOptions.continueOnFailure.value) {
      return await this.execute({
        action: action.nextAction,
        payload,
      });
    }

    if (
      action.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        action,
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
