import { shouldRunNow } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/should-run-now.utils';

const day = '2025-01-01';

describe('shouldRunNow', () => {
  it('returns true when now matches cron pattern */1 * * * *', () => {
    const cron = '*/1 * * * *';
    const now = new Date(`${day}T10:00:00Z`);

    expect(shouldRunNow(cron, now)).toBe(true);
  });

  it('returns true with a little root cron delay', () => {
    const cron = '*/1 * * * *';
    const now = new Date(`${day}T10:00:00.200Z`);

    expect(shouldRunNow(cron, now)).toBe(true);
  });

  it('returns true with a 50s root cron delay', () => {
    const cron = '*/1 * * * *';
    const now = new Date(`${day}T10:00:50Z`);

    expect(shouldRunNow(cron, now)).toBe(true);
  });

  it('returns true 5 times in a row for a */5 pattern', () => {
    const cron = '*/5 * * * *'; // every 5 minutes

    expect(shouldRunNow(cron, new Date(`${day}T10:00:00Z`))).toBe(true);
    expect(shouldRunNow(cron, new Date(`${day}T10:01:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:02:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:03:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:04:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:05:00Z`))).toBe(true);
    expect(shouldRunNow(cron, new Date(`${day}T10:06:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:07:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:08:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:09:00Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:10:00Z`))).toBe(true);
  });

  it('returns support a little root cron delay ', () => {
    const cron = '*/5 * * * *'; // every 5 minutes
    const day = '2025-01-01';

    expect(shouldRunNow(cron, new Date(`${day}T10:00:00.341Z`))).toBe(true);
    expect(shouldRunNow(cron, new Date(`${day}T10:01:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:02:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:03:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:04:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:05:00.341Z`))).toBe(true);
    expect(shouldRunNow(cron, new Date(`${day}T10:06:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:07:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:08:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:09:00.341Z`))).toBe(false);
    expect(shouldRunNow(cron, new Date(`${day}T10:10:00.341Z`))).toBe(true);
  });

  it('returns false for invalid cron pattern', () => {
    const cron = 'invalid-cron';
    const now = new Date();

    expect(shouldRunNow(cron, now)).toBe(false);
  });

  it('returns false if the next run is outside the interval window (2 minutes)', () => {
    const cron = '*/10 * * * *'; // every 10 minutes
    const now = new Date('2023-01-01T10:06:00Z'); // not a multiple of 10
    const interval2min = 2 * 60_000;

    expect(shouldRunNow(cron, now, interval2min)).toBe(false);
  });
});
