import { WorkspaceActivationStatus } from '@/workspace/types/WorkspaceActivationStatus';
import { isWorkspaceProvisioned } from '@/workspace/utils/isWorkspaceProvisioned';

describe('isWorkspaceProvisioned', () => {
  it('should return true for Created workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.CREATED,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(true);
  });

  it('should return true for Active workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(true);
  });

  it('should return true for Suspended workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(true);
  });

  it('should return false for Inactive workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.INACTIVE,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(false);
  });

  it('should return false for OngoingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(false);
  });

  it('should return false for PendingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    };

    expect(isWorkspaceProvisioned(workspace)).toBe(false);
  });

  it('should return false for undefined workspace', () => {
    expect(isWorkspaceProvisioned(undefined)).toBe(false);
  });

  it('should return false for null workspace', () => {
    expect(isWorkspaceProvisioned(null)).toBe(false);
  });
});
