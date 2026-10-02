import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';

export const APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES: readonly WorkflowActionType[] =
  [
    WorkflowActionType.SEND_EMAIL,
    WorkflowActionType.DRAFT_EMAIL,
    WorkflowActionType.CREATE_CALENDAR_EVENT,
  ];
