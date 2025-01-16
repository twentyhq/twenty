import { WorkspaceActivationStatus } from '../../types/WorkspaceActivationStatus';
import { isWorkspaceActiveOrSuspended } from '../isWorkspaceActiveOrSuspended';

describe('isWorkspaceActiveOrSuspended', () => {
  it('should return true for Active workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.Active,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(true);
  });

  it('should return true for Suspended workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.Suspended,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(true);
  });

  it('should return false for Inactive workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.Inactive,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for OngoingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.OngoingCreation,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for PendingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.PendingCreation,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for undefined workspace', () => {
    expect(isWorkspaceActiveOrSuspended(undefined)).toBe(false);
  });

  it('should return false for null workspace', () => {
    expect(isWorkspaceActiveOrSuspended(null)).toBe(false);
  });
});
