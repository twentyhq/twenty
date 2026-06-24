import { getDueTriggerTimestamp } from 'src/utils/get-due-trigger-timestamp.utils';

const getNowDate = (hour: string) => {
  return new Date(`2025-01-01T${hour}.100Z`);
};

describe('getDueTriggerTimestamp', () => {
  it('returns a timestamp when now matches cron pattern */1 * * * *', () => {
    const cron = '*/1 * * * *';

    expect(getDueTriggerTimestamp(cron, getNowDate('10:00:00'))).not.toBeNull();
  });

  it('returns a timestamp with a 50s root cron delay', () => {
    const cron = '*/1 * * * *';

    expect(getDueTriggerTimestamp(cron, getNowDate('10:00:50'))).not.toBeNull();
  });

  it('matches only on the trigger minute for a */5 pattern', () => {
    const cron = '*/5 * * * *'; // every 5 minutes

    expect(getDueTriggerTimestamp(cron, getNowDate('09:59:00'))).toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:00:00'))).not.toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:01:00'))).toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:02:00'))).toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:03:00'))).toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:04:00'))).toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:05:00'))).not.toBeNull();
    expect(getDueTriggerTimestamp(cron, getNowDate('10:06:00'))).toBeNull();
  });

  it('returns null for invalid cron pattern', () => {
    const cron = 'invalid-cron';

    expect(getDueTriggerTimestamp(cron, getNowDate('10:00:00'))).toBeNull();
  });

  it('returns null if the next run is outside the interval window (2 minutes)', () => {
    const cron = '*/10 * * * *'; // every 10 minutes
    const interval2min = 2 * 60_000;

    expect(
      getDueTriggerTimestamp(cron, getNowDate('10:06:00'), interval2min),
    ).toBeNull();
  });

  it('returns the same trigger timestamp for two ticks within the same window', () => {
    const cron = '*/5 * * * *';

    const onTime = getDueTriggerTimestamp(cron, getNowDate('10:00:00'));
    const drifted = getDueTriggerTimestamp(cron, getNowDate('10:00:59'));

    expect(onTime).toBe(new Date('2025-01-01T10:00:00.000Z').getTime());
    expect(drifted).toBe(onTime);
  });
});
