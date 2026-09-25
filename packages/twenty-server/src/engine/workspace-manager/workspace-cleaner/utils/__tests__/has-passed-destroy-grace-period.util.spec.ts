import { hasPassedDestroyGracePeriod } from 'src/engine/workspace-manager/workspace-cleaner/utils/has-passed-destroy-grace-period.util';

const NOW = new Date('2026-09-22T09:00:00.000Z');
const GRACE_PERIOD_IN_DAYS = 15;

const daysBeforeNow = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

describe('hasPassedDestroyGracePeriod', () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  it('should return false when the workspace is not soft deleted', () => {
    expect(
      hasPassedDestroyGracePeriod({
        workspace: { deletedAt: undefined },
        gracePeriodInDays: GRACE_PERIOD_IN_DAYS,
      }),
    ).toBe(false);
  });

  it('should return false when the workspace is still within the grace period', () => {
    expect(
      hasPassedDestroyGracePeriod({
        workspace: { deletedAt: daysBeforeNow(5) },
        gracePeriodInDays: GRACE_PERIOD_IN_DAYS,
      }),
    ).toBe(false);
  });

  it('should return false on the last day of the grace period', () => {
    expect(
      hasPassedDestroyGracePeriod({
        workspace: { deletedAt: daysBeforeNow(GRACE_PERIOD_IN_DAYS) },
        gracePeriodInDays: GRACE_PERIOD_IN_DAYS,
      }),
    ).toBe(false);
  });

  it('should return true once the grace period has passed', () => {
    expect(
      hasPassedDestroyGracePeriod({
        workspace: { deletedAt: daysBeforeNow(GRACE_PERIOD_IN_DAYS + 1) },
        gracePeriodInDays: GRACE_PERIOD_IN_DAYS,
      }),
    ).toBe(true);
  });
});
