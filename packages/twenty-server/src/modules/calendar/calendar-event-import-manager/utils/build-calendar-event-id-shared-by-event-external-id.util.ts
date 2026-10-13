import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventSharingProvider } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-provider.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

export const buildCalendarEventIdSharedByEventExternalId = ({
  provider,
  fetchedCalendarEvents,
  otherChannelAssociations,
  otherChannelCalendarEvents,
}: {
  provider: CalendarEventSharingProvider;
  fetchedCalendarEvents: Pick<FetchedCalendarEvent, 'id' | 'iCalUid'>[];
  otherChannelAssociations: {
    eventExternalId: string | null;
    calendarEventId: string;
  }[];
  otherChannelCalendarEvents: { id: string; iCalUid: string | null }[];
}): Map<string, string> => {
  const sharedCalendarEventIdByKey = new Map<string, string>();

  if (provider === ConnectedAccountProvider.GOOGLE) {
    for (const {
      eventExternalId,
      calendarEventId,
    } of otherChannelAssociations) {
      if (
        isNonEmptyString(eventExternalId) &&
        !sharedCalendarEventIdByKey.has(eventExternalId)
      ) {
        sharedCalendarEventIdByKey.set(eventExternalId, calendarEventId);
      }
    }
  } else {
    const calendarEventIdsSeenByOtherChannels = new Set(
      otherChannelAssociations.map(({ calendarEventId }) => calendarEventId),
    );

    for (const { id, iCalUid } of otherChannelCalendarEvents) {
      if (
        isNonEmptyString(iCalUid) &&
        calendarEventIdsSeenByOtherChannels.has(id) &&
        !sharedCalendarEventIdByKey.has(iCalUid)
      ) {
        sharedCalendarEventIdByKey.set(iCalUid, id);
      }
    }
  }

  const calendarEventIdSharedByEventExternalId = new Map<string, string>();
  const reusedCalendarEventIds = new Set<string>();

  for (const fetchedCalendarEvent of fetchedCalendarEvents) {
    const sharingKey =
      provider === ConnectedAccountProvider.GOOGLE
        ? fetchedCalendarEvent.id
        : fetchedCalendarEvent.iCalUid;

    if (!isNonEmptyString(sharingKey)) {
      continue;
    }

    const sharedCalendarEventId = sharedCalendarEventIdByKey.get(sharingKey);

    if (
      !isDefined(sharedCalendarEventId) ||
      reusedCalendarEventIds.has(sharedCalendarEventId)
    ) {
      continue;
    }

    reusedCalendarEventIds.add(sharedCalendarEventId);
    calendarEventIdSharedByEventExternalId.set(
      fetchedCalendarEvent.id,
      sharedCalendarEventId,
    );
  }

  return calendarEventIdSharedByEventExternalId;
};
