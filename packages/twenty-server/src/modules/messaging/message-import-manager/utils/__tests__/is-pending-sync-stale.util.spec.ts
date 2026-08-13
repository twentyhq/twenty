import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';
import { isPendingSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-pending-sync-stale.util';

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

describe('isPendingSyncStale', () => {
  it('should return false when syncStageStartedAt is null (freshly pending, healthy)', () => {
    expect(isPendingSyncStale(null)).toBe(false);
  });

  it('should return false when syncStageStartedAt is undefined (freshly pending, healthy)', () => {
    expect(isPendingSyncStale(undefined)).toBe(false);
  });

  it('should return true when a preserved timestamp is older than the sync timeout', () => {
    const syncStageStartedAt = new Date(
      Date.now() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT - 1,
    ).toISOString();

    expect(isPendingSyncStale(syncStageStartedAt)).toBe(true);
  });

  it('should return false when a preserved timestamp is within the sync timeout', () => {
    const syncStageStartedAt = new Date(
      Date.now() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT + 1,
    ).toISOString();

    expect(isPendingSyncStale(syncStageStartedAt)).toBe(false);
  });

  it('should throw an error if syncStageStartedAt is invalid', () => {
    expect(() => {
      isPendingSyncStale('invalid-date');
    }).toThrow('Invalid date format');
  });
});
