import { isDefined } from 'twenty-shared/utils';

import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';

// A channel normally sits in a *_PENDING stage with syncStageStartedAt set to
// null while it waits for the next fast cron tick (at most a few minutes) —
// that's healthy, not stale. syncStageStartedAt is only kept non-null for a
// pending channel on the throttle-recovery path (see
// MessageChannelSyncStatusService.markAsMessagesImportPending's
// preserveSyncStageStartedAt flag), so a real, old timestamp here means the
// channel fell through the fast cron/queue and never got picked back up.
export const isPendingSyncStale = (
  syncStageStartedAt?: string | null,
): boolean => {
  if (!isDefined(syncStageStartedAt)) {
    return false;
  }

  const syncStageStartedTime = new Date(syncStageStartedAt).getTime();

  if (isNaN(syncStageStartedTime)) {
    throw new Error('Invalid date format');
  }

  return (
    Date.now() - syncStageStartedTime > MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT
  );
};
