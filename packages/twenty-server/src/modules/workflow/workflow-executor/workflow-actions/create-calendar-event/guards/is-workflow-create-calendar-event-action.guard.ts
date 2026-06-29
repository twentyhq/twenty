import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowCreateCalendarEventAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowCreateCalendarEventAction = (
  action: WorkflowAction,
): action is WorkflowCreateCalendarEventAction => {
  return action.type === WorkflowActionType.CREATE_CALENDAR_EVENT;
};
