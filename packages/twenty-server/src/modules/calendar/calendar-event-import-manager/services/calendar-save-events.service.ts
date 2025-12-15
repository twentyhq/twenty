import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

type FetchedCalendarEventWithDBEvent = {
  fetchedCalendarEvent: FetchedCalendarEvent;
  existingCalendarEvent: CalendarEventWorkspaceEntity | null;
  newlyCreatedCalendarEvent: CalendarEventWorkspaceEntity | null;
};

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    fetchedCalendarEvents: FetchedCalendarEvent[],
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );

        const calendarChannelEventAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
            workspaceId,
            'calendarChannelEventAssociation',
          );

        const existingCalendarEvents = await calendarEventRepository.find({
          where: {
            iCalUid: Any(
              fetchedCalendarEvents.map((event) => event.iCalUid as string),
            ),
          },
        });

        const fetchedCalendarEventsWithDBEvents: FetchedCalendarEventWithDBEvent[] =
          fetchedCalendarEvents.map(
            (event): FetchedCalendarEventWithDBEvent => {
              const existingEventWithSameiCalUid = existingCalendarEvents.find(
                (existingEvent) => existingEvent.iCalUid === event.iCalUid,
              );

              return {
                fetchedCalendarEvent: event,
                existingCalendarEvent: existingEventWithSameiCalUid ?? null,
                newlyCreatedCalendarEvent: null,
              };
            },
          );

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

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
                      iCalUid: fetchedCalendarEvent.iCalUid,
                      title: fetchedCalendarEvent.title,
                      description: fetchedCalendarEvent.description,
                      startsAt: fetchedCalendarEvent.startsAt,
                      endsAt: fetchedCalendarEvent.endsAt,
                      location: fetchedCalendarEvent.location,
                      isFullDay: fetchedCalendarEvent.isFullDay,
                      isCanceled: fetchedCalendarEvent.isCanceled,
                      conferenceSolution:
                        fetchedCalendarEvent.conferenceSolution,
                      conferenceLink: {
                        primaryLinkLabel:
                          fetchedCalendarEvent.conferenceLinkLabel,
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
                      savedCalendarEvent.iCalUid ===
                      fetchedCalendarEvent.iCalUid,
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
                      `Existing calendar event with iCalUid ${fetchedCalendarEvent.iCalUid} not found - should never happen`,
                    );
                  }

                  return {
                    id: existingCalendarEvent.id,
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
                      primaryLinkLabel:
                        fetchedCalendarEvent.conferenceLinkLabel,
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
                    `Calendar event id not found for event with iCalUid ${fetchedCalendarEvent.iCalUid} - should never happen`,
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
                .flatMap(
                  ({ newlyCreatedCalendarEvent, fetchedCalendarEvent }) => {
                    if (!newlyCreatedCalendarEvent?.id) {
                      throw new Error(
                        `Newly created calendar event with iCalUid ${fetchedCalendarEvent.iCalUid} not found - should never happen`,
                      );
                    }

                    return fetchedCalendarEvent.participants.map(
                      (participant) => ({
                        ...participant,
                        calendarEventId: newlyCreatedCalendarEvent.id,
                      }),
                    );
                  },
                );

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
                      `Existing calendar event with iCalUid ${fetchedCalendarEvent.iCalUid} not found - should never happen`,
                    );
                  }

                  return fetchedCalendarEvent.participants.map(
                    (participant) => ({
                      ...participant,
                      calendarEventId: existingCalendarEvent.id,
                    }),
                  );
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
      },
    );
  }
}
