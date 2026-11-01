import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCalendarEventSharingKey } from 'src/modules/calendar/calendar-event-import-manager/utils/compute-calendar-event-sharing-key.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

type SharedAssociation = Pick<
  CalendarChannelEventAssociationWorkspaceEntity,
  'calendarChannelId' | 'calendarEventId' | 'eventExternalId'
>;

export const resolveCalendarEventSharing = ({
  provider,
  fetchedCalendarEvents,
  existingEventExternalIds,
  sharedAssociations,
  iCalUidByCalendarEventId,
  isCalendarEventSharingEnabled,
}: {
  provider: ConnectedAccountProvider;
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingEventExternalIds: Set<string>;
  sharedAssociations: SharedAssociation[];
  iCalUidByCalendarEventId: Map<string, string | null>;
  isCalendarEventSharingEnabled: boolean;
}): {
  calendarEventIdToLinkByEventExternalId: Map<string, string>;
  otherChannelIdsByCalendarEventId: Map<string, string[]>;
} => {
  const otherChannelIdsByCalendarEventId = new Map<string, string[]>();
  const calendarEventIdBySharingKey = new Map<string, string>();

  for (const association of sharedAssociations) {
    const otherChannelIds =
      otherChannelIdsByCalendarEventId.get(association.calendarEventId) ?? [];

    if (!otherChannelIds.includes(association.calendarChannelId)) {
      otherChannelIdsByCalendarEventId.set(association.calendarEventId, [
        ...otherChannelIds,
        association.calendarChannelId,
      ]);
    }

    const sharingKey = computeCalendarEventSharingKey({
      provider,
      eventExternalId: association.eventExternalId,
      iCalUid:
        iCalUidByCalendarEventId.get(association.calendarEventId) ?? null,
    });

    if (isDefined(sharingKey) && !calendarEventIdBySharingKey.has(sharingKey)) {
      calendarEventIdBySharingKey.set(sharingKey, association.calendarEventId);
    }
  }

  const calendarEventIdToLinkByEventExternalId = new Map<string, string>();

  if (!isCalendarEventSharingEnabled) {
    return {
      calendarEventIdToLinkByEventExternalId,
      otherChannelIdsByCalendarEventId,
    };
  }

  for (const fetchedCalendarEvent of fetchedCalendarEvents) {
    if (existingEventExternalIds.has(fetchedCalendarEvent.id)) {
      continue;
    }

    const sharingKey = computeCalendarEventSharingKey({
      provider,
      eventExternalId: fetchedCalendarEvent.id,
      iCalUid: fetchedCalendarEvent.iCalUid,
    });
    const calendarEventId = isDefined(sharingKey)
      ? calendarEventIdBySharingKey.get(sharingKey)
      : undefined;

    if (isDefined(calendarEventId)) {
      calendarEventIdToLinkByEventExternalId.set(
        fetchedCalendarEvent.id,
        calendarEventId,
      );
    }
  }

  return {
    calendarEventIdToLinkByEventExternalId,
    otherChannelIdsByCalendarEventId,
  };
};
