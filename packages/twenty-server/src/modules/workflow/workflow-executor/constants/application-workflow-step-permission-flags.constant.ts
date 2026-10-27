import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowActionType } from 'twenty-shared/workflow';

// Steps acting through a connected account need the matching tool permission on the app role
export const APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS: Partial<
  Record<WorkflowActionType, PermissionFlagType>
> = {
  [WorkflowActionType.SEND_EMAIL]: PermissionFlagType.SEND_EMAIL_TOOL,
  [WorkflowActionType.DRAFT_EMAIL]: PermissionFlagType.SEND_EMAIL_TOOL,
  [WorkflowActionType.CREATE_CALENDAR_EVENT]:
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
};
