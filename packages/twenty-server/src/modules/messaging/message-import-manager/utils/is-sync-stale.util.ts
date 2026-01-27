import { isDefined } from 'twenty-shared/utils';

import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';

export const isSyncStale = (syncStageStartedAt?: string | null): boolean => {
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
