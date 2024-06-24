import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';

export const isSyncStale = (syncStageStartedAt: string): boolean => {
  return (
    Date.now() - new Date(syncStageStartedAt).getTime() >
    MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT
  );
};
