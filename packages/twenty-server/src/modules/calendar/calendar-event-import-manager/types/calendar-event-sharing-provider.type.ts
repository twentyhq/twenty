import { type CALENDAR_EVENT_SHARING_PROVIDERS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-event-sharing-providers.constant';

export type CalendarEventSharingProvider =
  (typeof CALENDAR_EVENT_SHARING_PROVIDERS)[number];
