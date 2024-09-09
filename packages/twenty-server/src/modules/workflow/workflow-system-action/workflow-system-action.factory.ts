import { Injectable } from '@nestjs/common';

import { WorkflowSystemAction } from 'src/modules/workflow/workflow-system-action/workflow-system-action.interface';
import {
  WorkflowSystemActionException,
  WorkflowSystemActionExceptionCode,
} from 'src/modules/workflow/workflow-system-action/workflow-system-action.exception';
import { SendEmailAction } from 'src/modules/workflow/workflow-system-action/workflow-system-actions/send-email-action';
import { WorkflowSystemActionType } from 'src/modules/workflow/common/types/workflow-system-action.type';

@Injectable()
export class WorkflowSystemActionFactory {
  constructor(private readonly sendEmailAction: SendEmailAction) {}

  get(
    workflowSystemActionType: WorkflowSystemActionType,
  ): WorkflowSystemAction {
    switch (workflowSystemActionType) {
      case WorkflowSystemActionType.SEND_EMAIL:
        return this.sendEmailAction;
      default:
        throw new WorkflowSystemActionException(
          `Workflow system action not found for system action type '${workflowSystemActionType}'`,
          WorkflowSystemActionExceptionCode.INVALID_SYSTEM_ACTION_TYPE,
        );
    }
  }
}
