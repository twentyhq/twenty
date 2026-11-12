import { type calendar_v3 as calendarV3 } from 'googleapis';

import { GOOGLE_CALENDAR_RESOURCE_EMAIL_DOMAIN } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/constants/google-calendar-resource-email-domain.constant';

export const isGoogleCalendarResourceAttendee = (
  attendee: calendarV3.Schema$EventAttendee,
): boolean =>
  attendee.resource ||
  (attendee.email ?? '')
    .toLowerCase()
    .endsWith(GOOGLE_CALENDAR_RESOURCE_EMAIL_DOMAIN);
