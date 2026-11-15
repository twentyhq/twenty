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

  // Jest fixes the time zone when it starts (assigning process.env.TZ inside a
  // test has no effect), so instead make every local-time date method throw:
  // the cutoff must not depend on the server's time zone.
  it('uses only UTC date methods, so the server time zone has no effect', () => {
    const localTimeMethods = [
      'getDate',
      'setDate',
      'getHours',
      'setHours',
      'getMonth',
      'setMonth',
      'getFullYear',
      'setFullYear',
    ] as const;
    const spies = localTimeMethods.map((method) =>
      jest.spyOn(Date.prototype, method).mockImplementation(() => {
        throw new Error(`Date.prototype.${method} depends on the time zone`);
      }),
    );

    jest.setSystemTime(new Date('2026-11-14T00:10:00.000Z'));

    try {
      expect(computeTrashCleanupCutoffDate(14)).toEqual(
        new Date('2026-10-31T00:00:00.000Z'),
      );
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });
});
