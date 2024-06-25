import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';
import { isSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-sync-stale.util';

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

describe('isSyncStale', () => {
  it('should return true if sync is stale', () => {
    const syncStageStartedAt = new Date(
      Date.now() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT - 1,
    ).toISOString();

    const result = isSyncStale(syncStageStartedAt);

    expect(result).toBe(true);
  });

  it('should return false if sync is not stale', () => {
    const syncStageStartedAt = new Date(
      Date.now() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT + 1,
    ).toISOString();

    const result = isSyncStale(syncStageStartedAt);

    expect(result).toBe(false);
  });

  it('should return false if syncStageStartedAt is invalid', () => {
    const syncStageStartedAt = 'invalid-date';

    expect(() => {
      isSyncStale(syncStageStartedAt);
    }).toThrow('Invalid date format');
  });
});
