import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

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
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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

      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource.transaction(
        async (transactionManager: WorkspaceEntityManager) => {
          const existingAssociations =
            await calendarChannelEventAssociationRepository.find(
              {
                where: {
                  eventExternalId: Any(
                    fetchedCalendarEvents.map((event) => event.id),
                  ),
                  calendarChannelId: calendarChannel.id,
                },
              },
              transactionManager,
            );

          const existingCalendarEventIdByExternalId = new Map(
            existingAssociations.map((association) => [
              association.eventExternalId,
              association.calendarEventId,
            ]),
          );

          const existingAssociationIdByExternalId = new Map(
            existingAssociations.map((association) => [
              association.eventExternalId,
              association.id,
            ]),
          );

          const fetchedCalendarEventsWithDBEvents: FetchedCalendarEventWithDBEvent[] =
            fetchedCalendarEvents.map(
              (event): FetchedCalendarEventWithDBEvent => {
                const existingCalendarEventId =
                  existingCalendarEventIdByExternalId.get(event.id);

                return {
                  fetchedCalendarEvent: event,
                  existingCalendarEvent: existingCalendarEventId
                    ? ({
                        id: existingCalendarEventId,
                      } as CalendarEventWorkspaceEntity)
                    : null,
                  newlyCreatedCalendarEvent: null,
                };
              },
            );

          const newCalendarEventIdByExternalId = new Map<string, string>();

          const newCalendarEventsToInsert = fetchedCalendarEventsWithDBEvents
            .filter(
              ({ existingCalendarEvent }) => existingCalendarEvent === null,
            )
            .map(({ fetchedCalendarEvent }) => {
              const calendarEventId = uuid();

              newCalendarEventIdByExternalId.set(
                fetchedCalendarEvent.id,
                calendarEventId,
              );

              return {
                id: calendarEventId,
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
            });

          if (newCalendarEventsToInsert.length > 0) {
            await calendarEventRepository.insert(
              newCalendarEventsToInsert,
              transactionManager,
            );
          }

          const fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents: FetchedCalendarEventWithDBEvent[] =
            fetchedCalendarEventsWithDBEvents.map(
              ({ fetchedCalendarEvent, existingCalendarEvent }) => {
                const savedCalendarEventId = newCalendarEventIdByExternalId.get(
                  fetchedCalendarEvent.id,
                );

                return {
                  fetchedCalendarEvent,
                  existingCalendarEvent,
                  newlyCreatedCalendarEvent: savedCalendarEventId
                    ? ({
                        id: savedCalendarEventId,
                      } as CalendarEventWorkspaceEntity)
                    : null,
                };
              },
            );

          const existingEventsToUpdate =
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
                  criteria: existingCalendarEvent.id,
                  partialEntity: {
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
                  },
                };
              });

          if (existingEventsToUpdate.length > 0) {
            await calendarEventRepository.updateMany(
              existingEventsToUpdate,
              transactionManager,
            );
          }

          const calendarChannelEventAssociationsToSave: Pick<
            CalendarChannelEventAssociationWorkspaceEntity,
            | 'calendarEventId'
            | 'eventExternalId'
            | 'calendarChannelId'
            | 'recurringEventExternalId'
          >[] = fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents
            .filter(
              ({ newlyCreatedCalendarEvent }) =>
                newlyCreatedCalendarEvent !== null,
            )
            .map(({ fetchedCalendarEvent, newlyCreatedCalendarEvent }) => {
              if (!newlyCreatedCalendarEvent?.id) {
                throw new Error(
                  `Calendar event id not found for event with iCalUid ${fetchedCalendarEvent.iCalUid} - should never happen`,
                );
              }

              return {
                calendarEventId: newlyCreatedCalendarEvent.id,
                eventExternalId: fetchedCalendarEvent.id,
                calendarChannelId: calendarChannel.id,
                recurringEventExternalId:
                  fetchedCalendarEvent.recurringEventExternalId ?? '',
              };
            });

          if (calendarChannelEventAssociationsToSave.length > 0) {
            await calendarChannelEventAssociationRepository.insert(
              calendarChannelEventAssociationsToSave,
              transactionManager,
            );
          }

          const existingAssociationsToUpdate =
            fetchedCalendarEventsWithDBEventsEnrichedWithSavedEvents
              .filter(
                ({ existingCalendarEvent }) => existingCalendarEvent !== null,
              )
              .map(({ fetchedCalendarEvent }) => ({
                criteria: existingAssociationIdByExternalId.get(
                  fetchedCalendarEvent.id,
                )!,
                partialEntity: {
                  recurringEventExternalId:
                    fetchedCalendarEvent.recurringEventExternalId ?? '',
                },
              }));

          if (existingAssociationsToUpdate.length > 0) {
            await calendarChannelEventAssociationRepository.updateMany(
              existingAssociationsToUpdate,
              transactionManager,
            );
          }

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
    }, authContext);
  }
}
