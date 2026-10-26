import { PermissionFlagType } from '@/constants/PermissionFlagType';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';

// Steps that act through a connected account run on an application workflow
// only when the application's role holds the matching tool permission.
export const APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS: Partial<
  Record<WorkflowActionType, PermissionFlagType>
> = {
  [WorkflowActionType.SEND_EMAIL]: PermissionFlagType.SEND_EMAIL_TOOL,
  [WorkflowActionType.DRAFT_EMAIL]: PermissionFlagType.SEND_EMAIL_TOOL,
  [WorkflowActionType.CREATE_CALENDAR_EVENT]:
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
};
