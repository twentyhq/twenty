import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

type FetchedCalendarEventWithDBEvent = {
  fetchedCalendarEvent: FetchedCalendarEvent;
  existingCalendarEvent: CalendarEventWorkspaceEntity | null;
  newlyCreatedCalendarEvent: CalendarEventWorkspaceEntity | null;
};

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    fetchedCalendarEvents: FetchedCalendarEvent[],
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const calendarEventRepository =
      await this.twentyORMManager.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
      );

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    const existingCalendarEvents = await calendarEventRepository.find({
      where: {
        iCalUID: Any(
          fetchedCalendarEvents.map((event) => event.iCalUID as string),
        ),
      },
    });

    const fetchedCalendarEventsWithDBEvents: FetchedCalendarEventWithDBEvent[] =
      fetchedCalendarEvents.map((event): FetchedCalendarEventWithDBEvent => {
        const existingEventWithSameiCalUID = existingCalendarEvents.find(
          (existingEvent) => existingEvent.iCalUID === event.iCalUID,
        );

        return {
          fetchedCalendarEvent: event,
          existingCalendarEvent: existingEventWithSameiCalUID ?? null,
          newlyCreatedCalendarEvent: null,
        };
      });

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    await workspaceDataSource.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        const savedCalendarEvents = await calendarEventRepository.save(
          fetchedCalendarEventsWithDBEvents
            .filter(
              ({ existingCalendarEvent }) => existingCalendarEvent === null,
            )
            .map(
              ({ fetchedCalendarEvent }) =>
                ({
                  iCalUID: fetchedCalendarEvent.iCalUID,
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
                }) satisfies Omit<
                  CalendarEventWorkspaceEntity,
                  | 'id'
                  | 'calendarChannelEventAssociations'
                  | 'calendarEventParticipants'
                  | 'createdAt'
                  | 'updatedAt'
                  | 'deletedAt'
                >,
            ),
          {},
          transactionManager,
        );

        const fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents: FetchedCalendarEventWithDBEvent[] =
          fetchedCalendarEventsWithDBEvents.map(
            ({ fetchedCalendarEvent, existingCalendarEvent }) => {
              const savedCalendarEvent = savedCalendarEvents.find(
                (savedCalendarEvent) =>
                  savedCalendarEvent.iCalUID === fetchedCalendarEvent.iCalUID,
              );

              return {
                fetchedCalendarEvent,
                existingCalendarEvent: existingCalendarEvent,
                newlyCreatedCalendarEvent: savedCalendarEvent ?? null,
              };
            },
          );

        await calendarEventRepository.save(
          fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents
            .filter(
              ({ existingCalendarEvent }) => existingCalendarEvent !== null,
            )
            .map(({ fetchedCalendarEvent, existingCalendarEvent }) => {
              if (!existingCalendarEvent) {
                throw new Error(
                  `Existing calendar event with iCalUID ${fetchedCalendarEvent.iCalUID} not found - should never happen`,
                );
              }

              return {
                id: existingCalendarEvent.id,
                iCalUID: fetchedCalendarEvent.iCalUID,
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
              } satisfies Omit<
                CalendarEventWorkspaceEntity,
                | 'calendarChannelEventAssociations'
                | 'calendarEventParticipants'
                | 'createdAt'
                | 'updatedAt'
                | 'deletedAt'
              >;
            }),
          {},
          transactionManager,
        );

        const calendarChannelEventAssociationsToSave: Pick<
          CalendarChannelEventAssociationWorkspaceEntity,
          | 'calendarEventId'
          | 'eventExternalId'
          | 'calendarChannelId'
          | 'recurringEventExternalId'
        >[] = fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents.map(
          ({
            fetchedCalendarEvent,
            existingCalendarEvent,
            newlyCreatedCalendarEvent,
          }) => {
            const calendarEventId =
              existingCalendarEvent?.id ?? newlyCreatedCalendarEvent?.id;

            if (!calendarEventId) {
              throw new Error(
                `Calendar event id not found for event with iCalUID ${fetchedCalendarEvent.iCalUID} - should never happen`,
              );
            }

            return {
              calendarEventId,
              eventExternalId: fetchedCalendarEvent.id,
              calendarChannelId: calendarChannel.id,
              recurringEventExternalId:
                fetchedCalendarEvent.recurringEventExternalId ?? '',
            };
          },
        );

        await calendarChannelEventAssociationRepository.save(
          calendarChannelEventAssociationsToSave,
          {},
          transactionManager,
        );

        const participantsToCreate =
          fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents
            .filter(
              ({ newlyCreatedCalendarEvent }) =>
                newlyCreatedCalendarEvent !== null,
            )
            .flatMap(({ newlyCreatedCalendarEvent, fetchedCalendarEvent }) => {
              if (!newlyCreatedCalendarEvent?.id) {
                throw new Error(
                  `Newly created calendar event with iCalUID ${fetchedCalendarEvent.iCalUID} not found - should never happen`,
                );
              }

              return fetchedCalendarEvent.participants.map((participant) => ({
                ...participant,
                calendarEventId: newlyCreatedCalendarEvent.id,
              }));
            });

        // todo: we should prevent duplicate rows on calendarEventAssociation by creating
        // an index on calendarChannelId and calendarEventId
        const participantsToUpdate =
          fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents
            .filter(
              ({ existingCalendarEvent }) => existingCalendarEvent !== null,
            )
            .flatMap(({ fetchedCalendarEvent, existingCalendarEvent }) => {
              if (!existingCalendarEvent?.id) {
                throw new Error(
                  `Existing calendar event with iCalUID ${fetchedCalendarEvent.iCalUID} not found - should never happen`,
                );
              }

              return fetchedCalendarEvent.participants.map((participant) => ({
                ...participant,
                calendarEventId: existingCalendarEvent.id,
              }));
            });

        await this.calendarEventParticipantService.upsertAndDeleteCalendarEventParticipants(
          {
            participantsToCreate,
            participantsToUpdate,
            transactionManager,
            calendarChannel,
            connectedAccount,
            workspaceId,
          },
        );
      },
    );
  }
}
