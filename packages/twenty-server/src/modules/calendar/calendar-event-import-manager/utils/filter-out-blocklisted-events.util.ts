import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant-manager/utils/is-email-blocklisted.util';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';

export const filterOutBlocklistedEvents = (
  calendarChannelHandle: string,
  events: CalendarEventWithParticipants[],
  blocklist: string[],
) => {
  return events.filter((event) => {
    if (!event.participants) {
      return true;
    }

    return event.participants.every(
      (attendee) =>
        !isEmailBlocklisted(calendarChannelHandle, attendee.handle, blocklist),
    );
  });
};
