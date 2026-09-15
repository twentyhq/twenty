import { WorkspaceActivationStatus } from '@/workspace/types/WorkspaceActivationStatus';

export const PROVISIONED_WORKSPACE_ACTIVATION_STATUSES: WorkspaceActivationStatus[] =
  [
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.ACTIVE,
    WorkspaceActivationStatus.SUSPENDED,
  ];
