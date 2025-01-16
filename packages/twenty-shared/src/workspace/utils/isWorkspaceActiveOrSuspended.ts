import { WorkspaceActivationStatus } from '../types/WorkspaceActivationStatus';

export const isWorkspaceActiveOrSuspended = (
  workspace?: {
    activationStatus: WorkspaceActivationStatus;
  } | null,
): boolean => {
  return (
    workspace?.activationStatus === WorkspaceActivationStatus.Active ||
    workspace?.activationStatus === WorkspaceActivationStatus.Suspended
  );
};
