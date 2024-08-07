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

    const workflowActionRunner = this.workflowActionRunnerFactory.get(
      action.type,
    );

    const result = await workflowActionRunner.execute({
      action,
      workspaceId,
      payload,
    });

    if (result.data) {
      return await this.run({
        action: action.nextAction,
        workspaceId,
        payload: result.data,
      });
    }

    if (!result.error) {
      throw new Error('Execution result error, no data or error');
    }

    if (action.settings.errorHandlingOptions.continueOnFailure.value) {
      return await this.run({
        action: action.nextAction,
        workspaceId,
        payload,
      });
    }

    if (
      action.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.run({
        action,
        workspaceId,
        payload,
        attemptCount: attemptCount + 1,
      });
    }

    return result.error;
  }
}
