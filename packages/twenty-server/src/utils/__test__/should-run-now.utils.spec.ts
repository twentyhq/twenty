import { shouldRunNow } from 'src/utils/should-run-now.utils';

const getNowDate = (hour: string) => {
  return new Date(`2025-01-01T${hour}.100Z`);
};

describe('shouldRunNow', () => {
  it('returns true when now matches cron pattern */1 * * * *', () => {
    const cron = '*/1 * * * *';

    expect(shouldRunNow(cron, getNowDate('10:00:00'))).toBe(true);
  });

  it('returns true with a 50s root cron delay', () => {
    const cron = '*/1 * * * *';

    expect(shouldRunNow(cron, getNowDate('10:00:50'))).toBe(true);
  });

  it('returns true 5 times in a row for a */5 pattern', () => {
    const cron = '*/5 * * * *'; // every 5 minutes

    expect(shouldRunNow(cron, getNowDate('09:59:00'))).toBe(false);
    expect(shouldRunNow(cron, getNowDate('10:00:00'))).toBe(true);
    expect(shouldRunNow(cron, getNowDate('10:01:00'))).toBe(false);
    expect(shouldRunNow(cron, getNowDate('10:02:00'))).toBe(false);
    expect(shouldRunNow(cron, getNowDate('10:03:00'))).toBe(false);
    expect(shouldRunNow(cron, getNowDate('10:04:00'))).toBe(false);
    expect(shouldRunNow(cron, getNowDate('10:05:00'))).toBe(true);
    expect(shouldRunNow(cron, getNowDate('10:06:00'))).toBe(false);
  });

  it('returns false for invalid cron pattern', () => {
    const cron = 'invalid-cron';

    expect(shouldRunNow(cron, getNowDate('10:00:00'))).toBe(false);
  });

  it('returns false if the next run is outside the interval window (2 minutes)', () => {
    const cron = '*/10 * * * *'; // every 10 minutes
    const interval2min = 2 * 60_000;

    expect(shouldRunNow(cron, getNowDate('10:06:00'), interval2min)).toBe(
      false,
    );
  });
});
