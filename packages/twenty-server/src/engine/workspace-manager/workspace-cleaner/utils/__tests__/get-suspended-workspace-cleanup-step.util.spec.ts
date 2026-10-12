import { getSuspendedWorkspaceCleanupStep } from 'src/engine/workspace-manager/workspace-cleaner/utils/get-suspended-workspace-cleanup-step.util';

const NOW = new Date('2026-10-10T17:00:00.000Z');
const INACTIVE_DAYS_BEFORE_WARN = 7;
const INACTIVE_DAYS_BEFORE_SOFT_DELETE = 14;

const daysBeforeNow = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

const getStep = ({
  suspendedAt = null,
  deletedAt,
  isAlreadyWarned = false,
}: {
  suspendedAt?: Date | null;
  deletedAt?: Date;
  isAlreadyWarned?: boolean;
}) =>
  getSuspendedWorkspaceCleanupStep({
    workspace: { suspendedAt, deletedAt },
    isAlreadyWarned,
    inactiveDaysBeforeWarn: INACTIVE_DAYS_BEFORE_WARN,
    inactiveDaysBeforeSoftDelete: INACTIVE_DAYS_BEFORE_SOFT_DELETE,
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

  it('should only destroy a soft deleted workspace past the soft delete delay', () => {
    expect(
      getStep({
        suspendedAt: daysBeforeNow(20),
        deletedAt: daysBeforeNow(5),
        isAlreadyWarned: true,
      }),
    ).toEqual({ operation: 'destroy' });
  });

  it('should skip a workspace without suspension date', () => {
    expect(getStep({})).toBeNull();
  });

  it('should skip a workspace suspended for less than the warn delay', () => {
    expect(
      getStep({ suspendedAt: daysBeforeNow(INACTIVE_DAYS_BEFORE_WARN) }),
    ).toBeNull();
  });

  it('should warn a workspace suspended for more than the warn delay', () => {
    expect(getStep({ suspendedAt: daysBeforeNow(8) })).toEqual({
      operation: 'warn',
      daysSinceSuspended: 8,
    });
  });

  it('should not warn a workspace twice', () => {
    expect(
      getStep({ suspendedAt: daysBeforeNow(8), isAlreadyWarned: true }),
    ).toBeNull();
  });

  it('should still warn on the last day before soft delete', () => {
    expect(
      getStep({ suspendedAt: daysBeforeNow(INACTIVE_DAYS_BEFORE_SOFT_DELETE) }),
    ).toEqual({
      operation: 'warn',
      daysSinceSuspended: INACTIVE_DAYS_BEFORE_SOFT_DELETE,
    });
  });

  it('should soft delete a workspace suspended for more than the soft delete delay', () => {
    expect(
      getStep({ suspendedAt: daysBeforeNow(15), isAlreadyWarned: true }),
    ).toEqual({ operation: 'soft-delete', daysSinceSuspended: 15 });
  });
});
