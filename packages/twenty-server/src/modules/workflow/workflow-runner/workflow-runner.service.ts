import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/common/types/workflow-action.type';

const MAX_RETRIES_ON_FAILURE = 3;

@Injectable()
export class WorkflowRunnerService {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
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

    switch (action.type) {
      case WorkflowActionType.CODE:
        try {
          result = await this.serverlessFunctionService.executeOne(
            action.settings.serverlessFunctionId,
            workspaceId,
            payload,
          );
          break;
        } catch (err) {
          if (action.settings.errorHandlingOptions.continueOnFailure) {
            break;
          } else if (
            action.settings.errorHandlingOptions.retryOnFailure &&
            attemptCount < MAX_RETRIES_ON_FAILURE
          ) {
            return await this.run({
              action,
              workspaceId,
              payload,
              attemptCount: attemptCount + 1,
            });
          } else {
            return result;
          }
        }
      default:
        throw new WorkflowTriggerException(
          `Unknown action type '${action.type}'`,
          WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE,
        );
    }

    return await this.run({
      action: action.nextAction,
      workspaceId,
      payload: result,
    });
  }
}
