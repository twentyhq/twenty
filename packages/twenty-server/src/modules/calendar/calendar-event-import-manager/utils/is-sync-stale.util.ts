import { CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-import-ongoing-sync-timeout.constant';

export const isSyncStale = (syncStageStartedAt: string): boolean => {
  const syncStageStartedTime = new Date(syncStageStartedAt).getTime();

  if (isNaN(syncStageStartedTime)) {
    throw new Error('Invalid date format');
  }

  return (
    Date.now() - syncStageStartedTime > CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT
  );
};
