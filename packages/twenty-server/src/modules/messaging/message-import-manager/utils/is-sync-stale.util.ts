import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';

export const isSyncStale = (syncStageStartedAt: string): boolean => {
  try {
    const syncStageStartedTime = new Date(syncStageStartedAt).getTime();

    if (isNaN(syncStageStartedTime)) {
      throw new Error('Invalid date format');
    }

    return (
      Date.now() - syncStageStartedTime > MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT
    );
  } catch (error) {
    return false;
  }
};
