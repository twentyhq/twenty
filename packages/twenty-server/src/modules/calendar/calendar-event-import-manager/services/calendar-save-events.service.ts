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

type FetchedCalendarEventWithExistingEvent = {
  fetchedCalendarEvent: FetchedCalendarEvent;
  existingCalendarEvent?: CalendarEventWorkspaceEntity | null;
  newlyCreatedCalendarEvent?: CalendarEventWorkspaceEntity | null;
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

    const fetchedCalendarEventsWithExistingEvent = fetchedCalendarEvents.map(
      (event): FetchedCalendarEventWithExistingEvent => {
        const existingEventWithSameiCalUID = existingCalendarEvents.find(
          (existingEvent) => existingEvent.iCalUID === event.iCalUID,
        );

        if (existingEventWithSameiCalUID) {
          return {
            fetchedCalendarEvent: event,
            existingCalendarEvent: existingEventWithSameiCalUID,
          };
        }

        return {
          fetchedCalendarEvent: event,
          existingCalendarEvent: null,
        };
      },
    );

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    await workspaceDataSource.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        const savedCalendarEvents = await calendarEventRepository.save(
          fetchedCalendarEventsWithExistingEvent
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

        for (const savedCalendarEvent of savedCalendarEvents) {
          const fetchedCalendarEvent =
            fetchedCalendarEventsWithExistingEvent.find(
              ({ fetchedCalendarEvent }) =>
                fetchedCalendarEvent.iCalUID === savedCalendarEvent.iCalUID,
            );

          if (!fetchedCalendarEvent) {
            throw new Error(
              `Saved event with iCalUID ${savedCalendarEvent.iCalUID} not found - should never happen`,
            );
          }

          fetchedCalendarEvent.newlyCreatedCalendarEvent = {
            ...savedCalendarEvent,
          };
        }

        await calendarEventRepository.save(
          fetchedCalendarEventsWithExistingEvent
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
        >[] = fetchedCalendarEventsWithExistingEvent.map(
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

        const participantsToSave = fetchedCalendarEventsWithExistingEvent
          .filter(
            ({ newlyCreatedCalendarEvent }) =>
              newlyCreatedCalendarEvent !== null,
          )
          .flatMap(({ fetchedCalendarEvent }) =>
            fetchedCalendarEvent.participants.map((participant) => ({
              ...participant,
              calendarEventId: fetchedCalendarEvent.id,
            })),
          );

        const participantsToUpdate = fetchedCalendarEventsWithExistingEvent
          .filter(({ existingCalendarEvent }) => existingCalendarEvent !== null)
          .flatMap(({ fetchedCalendarEvent }) => {
            return fetchedCalendarEvent.participants.map((participant) => ({
              ...participant,
              calendarEventId: fetchedCalendarEvent.id,
            }));
          });

        await this.calendarEventParticipantService.upsertAndDeleteCalendarEventParticipants(
          {
            participantsToSave,
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
