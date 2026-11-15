import { computeTrashCleanupCutoffDate } from 'src/engine/trash-cleanup/utils/compute-trash-cleanup-cutoff-date.util';

const DELETED_AT = new Date('2026-11-15T23:59:59.999Z');

// The cleanup cron runs every day at 00:10 UTC.
const cleanupRunOnDay = (day: number) =>
  new Date(Date.UTC(2026, 10, 15 + day, 0, 10));

const isPermanentlyDeletedOnDay = (day: number, trashRetentionDays: number) => {
  jest.setSystemTime(cleanupRunOnDay(day));

  return DELETED_AT < computeTrashCleanupCutoffDate(trashRetentionDays);
};

describe('computeTrashCleanupCutoffDate', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns midnight UTC, trashRetentionDays days before today', () => {
    jest.setSystemTime(new Date('2026-11-29T00:10:00.000Z'));

    expect(computeTrashCleanupCutoffDate(14)).toEqual(
      new Date('2026-11-15T00:00:00.000Z'),
    );
  });

  it.each([1, 14, 30])(
    'keeps a record deleted just before midnight for at least %i full day(s)',
    (trashRetentionDays) => {
      expect(
        isPermanentlyDeletedOnDay(trashRetentionDays, trashRetentionDays),
      ).toBe(false);
    },
  );

  it.each([1, 14, 30])(
    'deletes it on the next cleanup run after %i day(s)',
    (trashRetentionDays) => {
      expect(
        isPermanentlyDeletedOnDay(trashRetentionDays + 1, trashRetentionDays),
      ).toBe(true);
    },
  );
});
