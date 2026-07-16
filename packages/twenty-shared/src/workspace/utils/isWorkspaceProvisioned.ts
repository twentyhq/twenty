import { isDefined } from '@/utils';
import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from '@/workspace/constants/ProvisionedWorkspaceActivationStatuses';
import type { WorkspaceActivationStatus } from '@/workspace/types/WorkspaceActivationStatus';

export const isWorkspaceProvisioned = (
  workspace?: {
    activationStatus: WorkspaceActivationStatus;
  } | null,
): boolean => {
  return (
    isDefined(workspace) &&
    PROVISIONED_WORKSPACE_ACTIVATION_STATUSES.includes(
      workspace.activationStatus,
    )
  );
};
