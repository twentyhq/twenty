import { isLastSuccessfulSyncStale } from 'src/modules/connected-account/utils/is-last-successful-sync-stale.util';
import { WEBHOOK_SYNC_STALENESS_THRESHOLD_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-sync-staleness-threshold-ms.constant';

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

describe('isLastSuccessfulSyncStale', () => {
  it('should return true when the last sync is older than the staleness threshold', () => {
    const syncedAt = new Date(
      Date.now() - WEBHOOK_SYNC_STALENESS_THRESHOLD_MS - 1,
    ).toISOString();

    expect(isLastSuccessfulSyncStale(syncedAt)).toBe(true);
  });

  it('should return false when the last sync is within the staleness threshold', () => {
    const syncedAt = new Date(
      Date.now() - WEBHOOK_SYNC_STALENESS_THRESHOLD_MS + 1,
    ).toISOString();

    expect(isLastSuccessfulSyncStale(syncedAt)).toBe(false);
  });

  it('should return true when the channel has never been synced', () => {
    expect(isLastSuccessfulSyncStale(null)).toBe(true);
    expect(isLastSuccessfulSyncStale(undefined)).toBe(true);
  });

  it('should throw an error when the timestamp is invalid', () => {
    expect(() => {
      isLastSuccessfulSyncStale('invalid-date');
    }).toThrow('Invalid date format');
  });
});
