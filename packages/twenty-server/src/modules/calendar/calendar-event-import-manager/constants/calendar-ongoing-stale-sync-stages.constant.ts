import { CalendarChannelSyncStage } from 'twenty-shared/types';

export const CALENDAR_ONGOING_STALE_SYNC_STAGES: CalendarChannelSyncStage[] = [
  CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
  CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
  CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
  CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
];
