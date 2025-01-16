import { WorkspaceActivationStatus } from '../types/WorkspaceActivationStatus';

export const isWorkspaceActiveOrSuspended = (
  workspace?: {
    activationStatus: WorkspaceActivationStatus;
  } | null,
): boolean => {
  return (
    workspace?.activationStatus === WorkspaceActivationStatus.ACTIVE ||
    workspace?.activationStatus === WorkspaceActivationStatus.SUSPENDED
  );
};
