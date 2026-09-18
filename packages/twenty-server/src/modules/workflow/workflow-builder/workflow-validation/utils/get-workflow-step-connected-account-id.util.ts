import { isValidUuid } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getWorkflowStepConnectedAccountId = (
  step: WorkflowAction,
): string | undefined => {
  switch (step.type) {
    case WorkflowActionType.CREATE_CALENDAR_EVENT:
    case WorkflowActionType.SEND_EMAIL:
    case WorkflowActionType.DRAFT_EMAIL: {
      const connectedAccountId = step.settings.input.connectedAccountId;

      return isValidUuid(connectedAccountId) ? connectedAccountId : undefined;
    }
    default:
      return undefined;
  }
};
