import { WorkspaceActivationStatus } from '@/workspace/types/WorkspaceActivationStatus';

// Statuses for which the workspace schema exists, whatever the billing state
export const PROVISIONED_WORKSPACE_ACTIVATION_STATUSES: WorkspaceActivationStatus[] =
  [
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.ACTIVE,
    WorkspaceActivationStatus.SUSPENDED,
  ];
