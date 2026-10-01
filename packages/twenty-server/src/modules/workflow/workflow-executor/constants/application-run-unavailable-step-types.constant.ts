import { WorkflowActionType } from 'twenty-shared/workflow';

export const APPLICATION_RUN_UNAVAILABLE_STEP_TYPES = [
  WorkflowActionType.SEND_EMAIL,
  WorkflowActionType.DRAFT_EMAIL,
  WorkflowActionType.CREATE_CALENDAR_EVENT,
];
