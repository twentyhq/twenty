import { getSuspendedWorkspaceCleanupStep } from 'src/engine/workspace-manager/workspace-cleaner/utils/get-suspended-workspace-cleanup-step.util';

const NOW = new Date('2026-10-10T17:00:00.000Z');

const daysBeforeNow = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

const getStep = (workspace: { suspendedAt: Date; deletedAt?: Date }) =>
  getSuspendedWorkspaceCleanupStep({
    workspace,
    isAlreadyWarned: false,
    inactiveDaysBeforeWarn: 7,
    inactiveDaysBeforeSoftDelete: 14,
  });

describe('getSuspendedWorkspaceCleanupStep', () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  it('should only destroy a workspace deleted early in its suspension, never warn it', () => {
    expect(
      getStep({ suspendedAt: daysBeforeNow(8), deletedAt: daysBeforeNow(8) }),
    ).toEqual({ operation: 'destroy' });
  });

  it('should warn a workspace suspended for more than the warn delay', () => {
    expect(getStep({ suspendedAt: daysBeforeNow(8) })).toEqual({
      operation: 'warn',
      daysSinceSuspended: 8,
    });
  });

  it('should soft delete a workspace suspended for more than the soft delete delay', () => {
    expect(getStep({ suspendedAt: daysBeforeNow(15) })).toEqual({
      operation: 'soft-delete',
      daysSinceSuspended: 15,
    });
  });
});
