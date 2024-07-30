import { Injectable } from '@nestjs/common';

import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowRunService {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  async run({
    action,
    workspaceId,
    payload,
  }: {
    action?: WorkflowAction;
    workspaceId: string;
    payload?: object;
  }) {
    if (!action) {
      return payload;
    }

    let result = {};

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
          return JSON.stringify(err);
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
