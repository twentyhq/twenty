import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type CalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-channel-role.type';
import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations.type';
import { type CalendarEventSavePlan } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-plan.type';
import { type CalendarEventSharingChannel } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-channel.type';
import { computeCalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/utils/compute-calendar-event-channel-role.util';
import {
  type ComparableCalendarEvent,
  hasCalendarEventChanged,
} from 'src/modules/calendar/calendar-event-import-manager/utils/has-calendar-event-changed.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

export const buildCalendarEventSaveOperations = ({
  fetchedCalendarEvents,
  existingAssociations,
  existingCalendarEvents,
  calendarChannelId,
  channelHandles,
  calendarEventIdToLinkByEventExternalId,
  otherChannelIdsByCalendarEventId,
  otherCalendarChannels,
}: {
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingAssociations: CalendarChannelEventAssociationWorkspaceEntity[];
  existingCalendarEvents: ComparableCalendarEvent[];
  calendarChannelId: string;
  channelHandles: string[];
  calendarEventIdToLinkByEventExternalId: Map<string, string>;
  otherChannelIdsByCalendarEventId: Map<string, string[]>;
  otherCalendarChannels: CalendarEventSharingChannel[];
}): CalendarEventSavePlan => {
  const existingAssociationByEventExternalId = new Map(
    existingAssociations.map((association) => [
      association.eventExternalId,
      association,
    ]),
  );
  const existingCalendarEventById = new Map(
    existingCalendarEvents.map((calendarEvent) => [
      calendarEvent.id,
      calendarEvent,
    ]),
  );
  const calendarChannelById = new Map(
    otherCalendarChannels.map((calendarChannel) => [
      calendarChannel.id,
      calendarChannel,
    ]),
  );

  const saveOperations: CalendarEventSaveOperations = {
    calendarEventsToInsert: [],
    calendarEventsToUpdate: [],
    associationsToInsert: [],
    associationsToUpdate: [],
  };
  const existingCalendarEventIds: string[] = [];
  const channelRoleByCalendarEventId = new Map<
    string,
    CalendarEventChannelRole
  >();
  const participantsOfNewEvents: FetchedParticipantWithCalendarEventId[] = [];
  const participantsOfExistingEvents: FetchedParticipantWithCalendarEventId[] =
    [];
  const participantsOfLinkedEvents: FetchedParticipantWithCalendarEventId[] =
    [];

  for (const fetchedCalendarEvent of fetchedCalendarEvents) {
    const {
      id: eventExternalId,
      participants,
      recurringEventExternalId = '',
    } = fetchedCalendarEvent;

    const calendarEvent = {
      iCalUid: fetchedCalendarEvent.iCalUid,
      title: fetchedCalendarEvent.title,
      description: fetchedCalendarEvent.description,
      startsAt: fetchedCalendarEvent.startsAt,
      endsAt: fetchedCalendarEvent.endsAt,
      location: fetchedCalendarEvent.location,
      isFullDay: fetchedCalendarEvent.isFullDay,
      isCanceled: fetchedCalendarEvent.isCanceled,
      conferenceSolution: fetchedCalendarEvent.conferenceSolution,
      conferenceLink: {
        primaryLinkLabel: fetchedCalendarEvent.conferenceLinkLabel,
        primaryLinkUrl: fetchedCalendarEvent.conferenceLinkUrl,
        secondaryLinks: [],
      },
      externalCreatedAt: fetchedCalendarEvent.externalCreatedAt,
      externalUpdatedAt: fetchedCalendarEvent.externalUpdatedAt,
    };

    const existingAssociation =
      existingAssociationByEventExternalId.get(eventExternalId);
    const calendarEventId =
      existingAssociation?.calendarEventId ??
      calendarEventIdToLinkByEventExternalId.get(eventExternalId);

    if (!isDefined(calendarEventId)) {
      const newCalendarEventId = uuid();

      channelRoleByCalendarEventId.set(newCalendarEventId, 'ONLY_CHANNEL');
      saveOperations.calendarEventsToInsert.push({
        id: newCalendarEventId,
        ...calendarEvent,
      });
      saveOperations.associationsToInsert.push({
        calendarEventId: newCalendarEventId,
        eventExternalId,
        calendarChannelId,
        recurringEventExternalId,
      });
      participantsOfNewEvents.push(
        ...participants.map((participant) => ({
          ...participant,
          calendarEventId: newCalendarEventId,
        })),
      );

      continue;
    }

    const existingCalendarEvent =
      existingCalendarEventById.get(calendarEventId);
    const channelRole = computeCalendarEventChannelRole({
      organizerHandle: fetchedCalendarEvent.organizerHandle,
      channelHandles,
      otherChannelIds:
        otherChannelIdsByCalendarEventId.get(calendarEventId) ?? [],
      calendarChannelById,
    });

    channelRoleByCalendarEventId.set(calendarEventId, channelRole);

    switch (channelRole) {
      case 'ONLY_CHANNEL':
      case 'ORGANIZER_CHANNEL':
      case 'ATTENDEE_CHANNEL':
        if (
          !isDefined(existingCalendarEvent) ||
          hasCalendarEventChanged({ existingCalendarEvent, calendarEvent })
        ) {
          saveOperations.calendarEventsToUpdate.push({
            criteria: calendarEventId,
            partialEntity: calendarEvent,
          });
        }
        break;
      case 'ATTENDEE_CHANNEL_WITH_ORGANIZER_SYNCING':
        break;
      default:
        assertUnreachable(channelRole);
    }

    const eventParticipants = participants.map((participant) => ({
      ...participant,
      calendarEventId,
    }));

    if (isDefined(existingAssociation)) {
      existingCalendarEventIds.push(calendarEventId);

      if (
        !isDefined(existingCalendarEvent) ||
        (existingAssociation.recurringEventExternalId ?? '') !==
          recurringEventExternalId
      ) {
        saveOperations.associationsToUpdate.push({
          criteria: existingAssociation.id,
          partialEntity: { recurringEventExternalId },
        });
      }

      participantsOfExistingEvents.push(...eventParticipants);

      continue;
    }

    saveOperations.associationsToInsert.push({
      calendarEventId,
      eventExternalId,
      calendarChannelId,
      recurringEventExternalId,
    });
    participantsOfLinkedEvents.push(...eventParticipants);
  }

  return {
    saveOperations,
    existingCalendarEventIds,
    channelRoleByCalendarEventId,
    participantsOfNewEvents,
    participantsOfExistingEvents,
    participantsOfLinkedEvents,
  };
};
