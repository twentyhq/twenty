import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

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

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        await workspaceDataSource.transaction(
          async (transactionManager: WorkspaceEntityManager) => {
            const existingCalendarEvents = await calendarEventRepository.find(
              {
                where: {
                  iCalUid: Any(
                    fetchedCalendarEvents.map(
                      (event) => event.iCalUid as string,
                    ),
                  ),
                },
              },
              transactionManager,
            );

            const existingEventsByICalUid = new Map(
              existingCalendarEvents.map((event) => [event.iCalUid, event]),
            );

            const calendarEventsToUpsert = fetchedCalendarEvents.map(
              (fetchedCalendarEvent) => ({
                id:
                  existingEventsByICalUid.get(
                    fetchedCalendarEvent.iCalUid as string,
                  )?.id ?? uuid(),
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
              }),
            );

            await calendarEventRepository.upsert(
              calendarEventsToUpsert,
              {
                conflictPaths: ['iCalUid'],
                skipUpdateIfNoValuesChanged: true,
              },
              transactionManager,
            );

            const eventIdByICalUid = new Map(
              calendarEventsToUpsert.map((event) => [event.iCalUid, event.id]),
            );

            const calendarChannelEventAssociationsToSave: Pick<
              CalendarChannelEventAssociationWorkspaceEntity,
              | 'calendarEventId'
              | 'eventExternalId'
              | 'calendarChannelId'
              | 'recurringEventExternalId'
            >[] = fetchedCalendarEvents.map((fetchedCalendarEvent) => {
              const calendarEventId = eventIdByICalUid.get(
                fetchedCalendarEvent.iCalUid as string,
              );

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
            });

            if (calendarChannelEventAssociationsToSave.length > 0) {
              await calendarChannelEventAssociationRepository.upsert(
                calendarChannelEventAssociationsToSave,
                { conflictPaths: ['calendarChannelId', 'calendarEventId'] },
                transactionManager,
              );
            }

            const participantsToCreate = fetchedCalendarEvents
              .filter(
                (event) =>
                  !existingEventsByICalUid.has(event.iCalUid as string),
              )
              .flatMap((fetchedCalendarEvent) => {
                const calendarEventId = eventIdByICalUid.get(
                  fetchedCalendarEvent.iCalUid as string,
                );

                if (!calendarEventId) {
                  throw new Error(
                    `Calendar event id not found for event with iCalUid ${fetchedCalendarEvent.iCalUid} - should never happen`,
                  );
                }

                return fetchedCalendarEvent.participants.map((participant) => ({
                  ...participant,
                  calendarEventId,
                }));
              });

            const participantsToUpdate = fetchedCalendarEvents
              .filter((event) =>
                existingEventsByICalUid.has(event.iCalUid as string),
              )
              .flatMap((fetchedCalendarEvent) => {
                const calendarEventId = eventIdByICalUid.get(
                  fetchedCalendarEvent.iCalUid as string,
                );

                if (!calendarEventId) {
                  throw new Error(
                    `Calendar event id not found for event with iCalUid ${fetchedCalendarEvent.iCalUid} - should never happen`,
                  );
                }

                return fetchedCalendarEvent.participants.map((participant) => ({
                  ...participant,
                  calendarEventId,
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
      },
    );
  }
}
