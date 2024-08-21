import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowActionRunnerFactory } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.factory';
import {
  WorkflowRunnerException,
  WorkflowRunnerExceptionCode,
} from 'src/modules/workflow/workflow-runner/workflow-runner.exception';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowRunOutput = {
  data?: object;
  error?: object;
};

@Injectable()
export class WorkflowRunnerWorkspaceService {
  constructor(
    private readonly workflowActionRunnerFactory: WorkflowActionRunnerFactory,
  ) {}

  async run({
    action,
    payload,
    attemptCount = 1,
  }: {
    action?: WorkflowAction;
    payload?: object;
    attemptCount?: number;
  }): Promise<WorkflowRunOutput> {
    if (!action) {
      return {
        data: payload,
      };
    }

    const workflowActionRunner = this.workflowActionRunnerFactory.get(
      action.type,
    );

    const result = await workflowActionRunner.execute({
      action,
      payload,
    });

    if (result.data) {
      return await this.run({
        action: action.nextAction,
        payload: result.data,
      });
    }

    if (!result.error) {
      throw new WorkflowRunnerException(
        'Execution result error, no data or error',
        WorkflowRunnerExceptionCode.WORKFLOW_FAILED,
      );
    }

    if (action.settings.errorHandlingOptions.continueOnFailure.value) {
      return await this.run({
        action: action.nextAction,
        payload,
      });
    }

    if (
      action.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.run({
        action,
        payload,
        attemptCount: attemptCount + 1,
      });
    }

    throw new WorkflowRunnerException(
      `Workflow failed: ${result.error}`,
      WorkflowRunnerExceptionCode.WORKFLOW_FAILED,
    );
  }
}
