import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowActionRunnerFactory } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.factory';

const MAX_RETRIES_ON_FAILURE = 3;

@Injectable()
export class WorkflowRunnerService {
  constructor(
    private readonly workflowActionRunnerFactory: WorkflowActionRunnerFactory,
  ) {}

  async run({
    action,
    workspaceId,
    payload,
    attemptCount = 1,
  }: {
    action?: WorkflowAction;
    workspaceId: string;
    payload?: object;
    attemptCount?: number;
  }) {
    if (!action) {
      return payload;
    }

    let result: object | undefined = undefined;

    const workflowActionRunner = this.workflowActionRunnerFactory.get(
      action.type,
    );

    const executionResult = await workflowActionRunner.execute({
      action,
      workspaceId,
      payload,
    });

    if (executionResult.data) {
      result = executionResult.data;
    } else if (!executionResult.error) {
      throw new Error('Execution result error, no data or error');
    } else if (action.settings.errorHandlingOptions.continueOnFailure.value) {
      result = payload;
    } else if (
      action.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.run({
        action,
        workspaceId,
        payload,
        attemptCount: attemptCount + 1,
      });
    } else {
      return executionResult.error;
    }

    return await this.run({
      action: action.nextAction,
      workspaceId,
      payload: result,
    });
  }
}
